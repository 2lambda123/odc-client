import { getTableListByDatabaseName } from '@/common/network/table';
import { createTask, getCycleTaskDetail } from '@/common/network/task';
import Crontab from '@/component/Crontab';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import {
  CreateTaskRecord,
  ITable,
  SQLPlanTriggerStrategy,
  TaskExecStrategy,
  TaskOperationType,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { isClient } from '@/util/env';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Drawer, Form, Input, Modal, Radio, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import ArchiveRange from './ArchiveRange';
import styles from './index.less';
import VariableConfig from './VariableConfig';

export enum IArchiveRange {
  PORTION = 'portion',
  ALL = 'all',
}

export const variable = {
  name: '',
  format: '',
  pattern: [null],
};

const defaultValue = {
  triggerStrategy: TaskExecStrategy.START_NOW,
  archiveRange: IArchiveRange.PORTION,
  variables: [variable],
  tables: [null],
};

interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}

const getVariables = (
  value: {
    name: string;
    format: string;
    pattern: {
      operator: string;
      step: number;
      unit: string;
    }[];
  }[],
) => {
  return value?.map(({ name, format, pattern }) => {
    const _pattern = pattern
      ?.map(({ operator, step, unit }) => {
        return `${operator}${step}${unit}`;
      })
      ?.join(' ');
    return {
      name,
      pattern: `${format}|${_pattern}`,
    };
  });
};

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [formData, setFormData] = useState(null);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [crontab, setCrontab] = useState(null);
  const [tables, setTables] = useState<ITable[]>();
  const [form] = Form.useForm();
  const databaseId = Form.useWatch('databaseId', form);
  const { session, database } = useDBSession(databaseId);
  const databaseName = database?.name;

  const loadTables = async () => {
    const tables = await getTableListByDatabaseName(session?.sessionId, databaseName);
    setTables(tables);
  };

  const crontabRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();

  const { dataArchiveVisible, SQLPlanEditId } = modalStore;
  const isEdit = !!SQLPlanEditId;
  const loadEditData = async (editId: number) => {
    const data = await getCycleTaskDetail(editId);
    const {
      jobParameters,
      triggerConfig: { triggerStrategy, cronExpression, hours, days },
      ...rest
    } = data;
    const formData = {
      ...rest,
      ...jobParameters,
    };
    setFormData(formData);
    form.setFieldsValue(formData);
    crontabRef.current.setValue({
      mode:
        triggerStrategy === SQLPlanTriggerStrategy.CRON ? CrontabMode.custom : CrontabMode.default,
      dateType: triggerStrategy as any,
      cronString: cronExpression,
      hour: hours,
      dayOfMonth: days,
      dayOfWeek: days,
    });
  };

  useEffect(() => {
    if (SQLPlanEditId) {
      loadEditData(SQLPlanEditId);
    }
  }, [SQLPlanEditId]);

  const setFormStatus = (fieldName: string, errorMessage: string) => {
    form.setFields([
      {
        name: [fieldName],
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: '确认取消此 数据归档吗？',
        centered: true,
        onOk: () => {
          props.modalStore.changeDataArchiveModal(false);
        },
      });
    } else {
      props.modalStore.changeDataArchiveModal(false);
    }
  };

  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
  };

  const handleCreate = async (data: Partial<CreateTaskRecord>) => {
    const res = await createTask(data);
    handleCancel(false);
    setConfirmLoading(false);
    if (res) {
      openTasksPage(TaskPageType.DATA_ARCHIVE, TaskPageScope.CREATED_BY_CURRENT_USER);
    }
  };

  const handleEditAndConfirm = async (data: Partial<CreateTaskRecord>) => {
    Modal.confirm({
      title: '确认要修改此 数据归档吗？',
      content: (
        <>
          <div>编辑数据归档</div>
          <div>任务需要重新审批，审批通过后此任务将重新执行</div>
        </>
      ),
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: () => {
        handleCreate(data);
      },
      onCancel: () => {
        setConfirmLoading(false);
      },
    });
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          name,
          startAt,
          connectionId,
          databaseId,
          targetDatabase,
          variables,
          tables,
          deleteAfterMigration,
          triggerStrategy,
          description,
        } = values;
        const parameters = {
          type: TaskType.MIGRATION,
          operationType: isEdit ? TaskOperationType.UPDATE : TaskOperationType.CREATE,
          taskId: SQLPlanEditId,
          scheduleTaskParameters: {
            name,
            sourceDatabaseId: databaseId,
            targetDataBaseId: targetDatabase,
            variables: getVariables(variables),
            tables,
            deleteAfterMigration,
          },
          triggerConfig: {
            triggerStrategy,
          },
        };

        if (triggerStrategy === TaskExecStrategy.TIMER) {
          const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = crontab;
          parameters.triggerConfig = {
            triggerStrategy: mode === 'custom' ? 'CRON' : dateType,
            days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
            hours: hour,
            cronExpression: cronString,
          };
        } else if (triggerStrategy === TaskExecStrategy.START_AT) {
          parameters.triggerConfig = {
            startAt: startAt?.valueOf(),
          };
        }
        const data = {
          connectionId,
          databaseId,
          taskType: TaskType.ALTER_SCHEDULE,
          parameters,
          description,
        };

        setConfirmLoading(true);
        if (!isEdit) {
          delete parameters.taskId;
        }
        if (isEdit) {
          handleEditAndConfirm(data);
        } else {
          handleCreate(data);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const handleFieldsChange = () => {
    setHasEdit(true);
  };

  const handleReset = () => {
    setFormData(null);
    form?.resetFields();
    crontabRef.current?.resetFields();
  };

  useEffect(() => {
    if (!dataArchiveVisible) {
      handleReset();
    }
  }, [dataArchiveVisible]);

  useEffect(() => {
    if (databaseName) {
      loadTables();
      form.setFieldValue('tables', [null]);
    }
  }, [databaseName]);

  return (
    <Drawer
      destroyOnClose
      className={styles['data-archive']}
      width={760}
      title={isEdit ? '编辑数据归档' : '新建数据归档'}
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            取消
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {isEdit ? '保存' : '新建'}
          </Button>
        </Space>
      }
      visible={dataArchiveVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        requiredMark="optional"
        initialValues={defaultValue}
        onFieldsChange={handleFieldsChange}
      >
        <Form.Item
          required
          label="任务名称"
          name="name"
          rules={[
            {
              required: true,
              message: '请输入',
            },
          ]}
        >
          <Input style={{ width: '320px' }} placeholder="请输入" />
        </Form.Item>
        <Space align="start">
          <DatabaseSelect label="源端数据库" projectId={projectId} />
          <DatabaseSelect label="目标数据库" name="targetDatabase" projectId={projectId} />
        </Space>
        <VariableConfig />
        <ArchiveRange tables={tables} />
        <Form.Item name="deleteAfterMigration" valuePropName="checked">
          <Checkbox>
            <Space>
              清理源端已归档数据
              <span className={styles.desc}>
                若您进行清理，默认立即清理且不做备份；清理任务完成后支持回滚
              </span>
            </Space>
          </Checkbox>
        </Form.Item>
        <Form.Item label="执行方式" name="triggerStrategy" required>
          <Radio.Group>
            <Radio.Button value={TaskExecStrategy.START_NOW}>立即执行</Radio.Button>
            {!isClient() ? (
              <Radio.Button value={TaskExecStrategy.START_AT}>定时执行</Radio.Button>
            ) : null}
            <Radio.Button value={TaskExecStrategy.TIMER}>周期执行</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const triggerStrategy = getFieldValue('triggerStrategy') || [];
            if (triggerStrategy === TaskExecStrategy.START_AT) {
              return (
                <Form.Item name="startAt">
                  <DatePicker showTime suffixIcon={<FieldTimeOutlined />} />
                </Form.Item>
              );
            }
            if (triggerStrategy === TaskExecStrategy.TIMER) {
              return (
                <Form.Item>
                  <Crontab
                    ref={crontabRef}
                    initialValue={crontab}
                    onValueChange={handleCrontabChange}
                  />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
        <Form.Item
          label="备注"
          name="description"
          rules={[
            {
              max: 200,
              message: '备注不超过 200 个字符',
            },
          ]}
        >
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default inject('modalStore')(observer(CreateModal));