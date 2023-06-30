import { createTask, getAsyncTaskUploadUrl } from '@/common/network/task';
import { isReadonlyPublicConnection } from '@/component/Acess';
import CommonIDE from '@/component/CommonIDE';
import FormItemPanel from '@/component/FormItemPanel';
import ODCDragger from '@/component/OSSDragger2';
import TaskTimer from '@/component/Task/component/TimerSelect';
import {
  ConnectionMode,
  SQLContentType,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import {
  AutoComplete,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Space,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { getLocale } from 'umi';
import DatabaseSelect from '../../component/DatabaseSelect';
import styles from './index.less';

const MAX_FILE_SIZE = 1024 * 1024 * 256;

interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
}

enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [form] = Form.useForm();
  const [sqlContentType, setSqlContentType] = useState(SQLContentType.TEXT);
  const [rollbackContentType, setRollbackContentType] = useState(SQLContentType.TEXT);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const isReadonlyPublicConn = isReadonlyPublicConnection(database?.dataSource);
  const isMySQL = connection?.dialectType === ConnectionMode.OB_MYSQL;

  const getFileIdAndNames = (files: UploadFile[]) => {
    const ids = [];
    const names = [];
    files
      ?.filter((file) => file?.status === 'done')
      ?.forEach((file) => {
        ids.push(file?.response?.data?.contents?.[0]?.objectId);
        names.push(file?.name);
      });
    return {
      ids,
      names,
      size: ids.length,
    };
  };

  const checkFileSizeAmount = (files: UploadFile[]): boolean => {
    const fileSizeAmount = files?.reduce((prev, current) => {
      return prev + current.size;
    }, 0);
    if (fileSizeAmount > MAX_FILE_SIZE) {
      /**
       * 校验文件总大小
       */
      message.warn(
        formatMessage({
          id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
        }),
        //文件最多不超过 256MB
      );
      return false;
    }
    return true;
  };

  const handleChange = (type: 'sqlContentType' | 'rollbackContentType', value: SQLContentType) => {
    if (type === 'sqlContentType') {
      setSqlContentType(value);
    } else {
      setRollbackContentType(value);
    }
  };

  const handleSqlChange = (type: 'sqlContent' | 'rollbackSqlContent', sql: string) => {
    form?.setFieldsValue({
      [type]: sql,
    });
    setHasEdit(true);
  };

  const handleFieldsChange = () => {
    setHasEdit(true);
  };

  const handleBeforeUpload = (file, type: 'sqlFiles' | 'rollbackSqlFiles') => {
    const isLt20M = MAX_FILE_SIZE > file.size;
    if (!isLt20M) {
      setTimeout(() => {
        setFormStatus(
          type,
          formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
          }),
          //文件最多不超过 256MB
        );
      }, 0);
    }
    return isLt20M;
  };

  const handleFileChange = (files: UploadFile[], type: 'sqlFiles' | 'rollbackSqlFiles') => {
    form?.setFieldsValue({
      [type]: files,
    });

    if (files.some((item) => item?.error?.isLimit)) {
      setFormStatus(
        type,
        formatMessage({
          id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
        }),
        //文件最多不超过 256MB
      );
    } else {
      setFormStatus(type, '');
    }
  };

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
        title: formatMessage({
          id: 'odc.components.CreateAsyncTaskModal.AreYouSureYouWant.1',
        }),

        //确认取消数据库变更吗？
        centered: true,
        onOk: () => {
          modalStore.changeCreateAsyncTaskModal(false);
        },
      });
    } else {
      modalStore.changeCreateAsyncTaskModal(false);
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          connectionId,
          databaseId,
          databaseName,
          executionStrategy,
          executionTime,
          sqlContentType,
          rollbackContentType,
          sqlContent,
          sqlFiles,
          rollbackSqlContent,
          rollbackSqlFiles,
          timeoutMillis,
          errorStrategy,
          description,
          queryLimit,
          delimiter,
        } = values;
        const sqlFileIdAndNames = getFileIdAndNames(sqlFiles);
        const rollbackSqlFileIdAndNames = getFileIdAndNames(rollbackSqlFiles);
        const parameters = {
          timeoutMillis: timeoutMillis ? timeoutMillis * 60 * 60 * 1000 : undefined,
          errorStrategy,
          sqlContent,
          sqlObjectIds: sqlFileIdAndNames?.ids,
          sqlObjectNames: sqlFileIdAndNames?.names,
          rollbackSqlContent,
          rollbackSqlObjectIds: rollbackSqlFileIdAndNames?.ids,
          rollbackSqlObjectNames: rollbackSqlFileIdAndNames?.names,
          queryLimit,
          delimiter,
        };

        if (!checkFileSizeAmount(sqlFiles) || !checkFileSizeAmount(rollbackSqlFiles)) {
          return;
        }
        if (sqlContentType === SQLContentType.FILE) {
          delete parameters.sqlContent;
          if (sqlFiles?.some((item) => item?.error?.isLimit)) {
            setFormStatus(
              'sqlFiles',
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe',
              }),
              //文件最多不超过 256MB
            );
            return;
          }

          if (!sqlFileIdAndNames?.size || sqlFileIdAndNames?.size !== sqlFiles?.length) {
            setFormStatus(
              'sqlFiles',
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.UploadAnSqlFile',
              }),

              //请上传 SQL 文件
            );
            return;
          }
        } else {
          delete parameters.sqlObjectIds;
          delete parameters.sqlObjectNames;
        }

        if (rollbackContentType === SQLContentType.FILE) {
          delete parameters.rollbackSqlContent;
        } else {
          delete parameters.rollbackSqlObjectIds;
          delete parameters.rollbackSqlObjectNames;
        }
        const data = {
          connectionId,
          projectId,
          databaseName,
          databaseId,
          taskType: TaskType.ASYNC,
          executionStrategy,
          executionTime,
          parameters,
          description,
        };

        if (executionStrategy === TaskExecStrategy.TIMER) {
          data.executionTime = executionTime?.valueOf();
        } else {
          data.executionTime = undefined;
        }

        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);

        if (res) {
          openTasksPage(TaskPageType.ASYNC, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  useEffect(() => {
    const { createAsyncTaskVisible, asyncTaskData } = modalStore;
    if (createAsyncTaskVisible && asyncTaskData) {
      handleSqlChange('sqlContent', asyncTaskData.sql);
    }
  }, []);

  return (
    <Drawer
      className={styles.asyncTask}
      width={520}
      title={formatMessage({
        id: 'odc.components.CreateAsyncTaskModal.CreateDatabaseChanges',
      })}
      /*新建数据库变更*/
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.Cancel',
              })

              /* 取消 */
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.New',
              })

              /* 新建 */
            }
          </Button>
        </Space>
      }
      visible={modalStore.createAsyncTaskVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        name="basic"
        initialValues={{
          executionStrategy: TaskExecStrategy.AUTO,
        }}
        layout="vertical"
        requiredMark="optional"
        form={form}
        onFieldsChange={handleFieldsChange}
      >
        <DatabaseSelect projectId={projectId} />
        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.SqlContent',
          })}
          /* SQL 内容 */
          name="sqlContentType"
          initialValue={SQLContentType.TEXT}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.SelectSqlContent',
              }),

              // 请选择 SQL 内容
            },
          ]}
        >
          <Radio.Group
            onChange={(e) => {
              handleChange('sqlContentType', e.target.value);
            }}
          >
            <Radio.Button value={SQLContentType.TEXT}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.SqlEntry',
                })

                /* SQL录入 */
              }
            </Radio.Button>
            <Radio.Button value={SQLContentType.FILE}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.UploadAttachments',
                })

                /* 上传附件 */
              }
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="sqlContent"
          className={`${styles.sqlContent} ${
            sqlContentType !== SQLContentType.TEXT && styles.hide
          }`}
          rules={[
            {
              required: sqlContentType === SQLContentType.TEXT,
              message: formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.EnterTheSqlContent',
              }),

              // 请填写 SQL 内容
            },
          ]}
          style={{ height: '280px' }}
        >
          <CommonIDE
            initialSQL={modalStore.asyncTaskData?.sql}
            language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
            onSQLChange={(sql) => {
              handleSqlChange('sqlContent', sql);
            }}
          />
        </Form.Item>
        <Form.Item
          name="sqlFiles"
          className={sqlContentType !== SQLContentType.FILE && styles.hide}
        >
          <ODCDragger
            accept=".sql"
            uploadFileOpenAPIName="UploadFile"
            onBeforeUpload={(file) => {
              return handleBeforeUpload(file, 'sqlFiles');
            }}
            multiple={true}
            tip={formatMessage({
              id: 'odc.component.OSSDragger2.YouCanDragAndDrop',
            })}
            maxCount={500}
            action={getAsyncTaskUploadUrl()}
            headers={{
              'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
              'Accept-Language': getLocale(),
            }}
            onFileChange={(files) => {
              handleFileChange(files, 'sqlFiles');
            }}
          >
            <p className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.ClickOrDragMultipleFiles',
                })
                /*点击或将多个文件拖拽到这里上传*/
              }
            </p>
            <p className={styles.desc}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe.2',
                })
                /*文件最多不超过 256MB ，支持扩展名 .sql*/
              }
            </p>
          </ODCDragger>
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.RollbackScheme',
          })}
          /*回滚方案*/
          name="rollbackContentType"
          initialValue={SQLContentType.TEXT}
        >
          <Radio.Group
            onChange={(e) => {
              handleChange('rollbackContentType', e.target.value);
            }}
          >
            <Radio.Button value={SQLContentType.TEXT}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.SqlEntry',
                })

                /* SQL录入 */
              }
            </Radio.Button>
            <Radio.Button value={SQLContentType.FILE}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.UploadAttachments',
                })

                /* 上传附件 */
              }
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="rollbackSqlContent"
          className={`${styles.sqlContent} ${
            rollbackContentType !== SQLContentType.TEXT && styles.hide
          }`}
          style={{ height: '280px' }}
        >
          <CommonIDE
            language={`${isMySQL ? 'obmysql' : 'oboracle'}`}
            onSQLChange={(sql) => {
              handleSqlChange('rollbackSqlContent', sql);
            }}
          />
        </Form.Item>
        <Form.Item
          name="rollbackSqlFiles"
          className={rollbackContentType !== SQLContentType.FILE && styles.hide}
        >
          <ODCDragger
            accept=".sql"
            uploadFileOpenAPIName="UploadFile"
            onBeforeUpload={(file) => {
              return handleBeforeUpload(file, 'rollbackSqlFiles');
            }}
            multiple={true}
            maxCount={500}
            action={getAsyncTaskUploadUrl()}
            headers={{
              'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
              'Accept-Language': getLocale(),
            }}
            onFileChange={(files) => {
              handleFileChange(files, 'rollbackSqlFiles');
            }}
          >
            <p className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.ClickOrDragMultipleFiles',
                })
                /*点击或将多个文件拖拽到这里上传*/
              }
            </p>
            <p className={styles.desc}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.TheMaximumSizeOfThe.2',
                })
                /*文件最多不超过 256MB ，支持扩展名 .sql*/
              }
            </p>
          </ODCDragger>
        </Form.Item>
        <Form.Item
          name="delimiter"
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.Separator',
          })}
          /* 分隔符 */ initialValue=";"
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.EnterADelimiter',
              }),

              //请输入分隔符
            },
          ]}
        >
          <AutoComplete
            style={{ width: 90 }}
            options={[';', '/', '//', '$', '$$'].map((value) => {
              return {
                value,
              };
            })}
          />
        </Form.Item>
        <Form.Item
          name="queryLimit"
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.QueryResultLimits',
          })}
          /* 查询结果限制 */
          initialValue={1000}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.EnterAQueryResultLimit',
              }),

              //请输入查询结果限制
            },
          ]}
        >
          <InputNumber min={1} max={10000 * 100} />
        </Form.Item>
        <FormItemPanel
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.TaskSettings',
          })}
          /*任务设置*/ keepExpand
        >
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateAsyncTaskModal.TaskErrorHandling',
            })}
            /* 任务错误处理 */
            name="errorStrategy"
            initialValue={ErrorStrategy.ABORT}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.SelectTaskErrorHandling',
                }),

                // 请选择任务错误处理
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ErrorStrategy.ABORT}>
                {
                  formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.StopATask',
                  })

                  /* 停止任务 */
                }
              </Radio>
              <Radio value={ErrorStrategy.CONTINUE}>
                {
                  formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.IgnoreErrorsContinueTasks',
                  })

                  /* 忽略错误继续任务 */
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
          <TaskTimer isReadonlyPublicConn={isReadonlyPublicConn} />
        </FormItemPanel>
        {!isReadonlyPublicConn && (
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateAsyncTaskModal.ExecutionTimeout',
            })}
            /* 执行超时时间 */ required
          >
            <Form.Item
              label={formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.Hours',
              })}
              /* 小时 */
              name="timeoutMillis"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.EnterATimeoutPeriod',
                  }),

                  // 请输入超时时间
                },
                {
                  type: 'number',
                  max: 480,
                  message: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.MaximumLengthOfHours',
                  }),

                  // 最大不超过480小时
                },
              ]}
              initialValue={48}
              noStyle
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <span className={styles.hour}>
              {
                formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.Hours',
                })

                /* 小时 */
              }
            </span>
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.TaskDescription',
          })}
          /* 任务描述 */
          name="description"
          rules={[
            {
              max: 200,
              message: formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.TheTaskDescriptionCannotExceed',
              }),

              // 任务描述不超过 200 个字符
            },
          ]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default inject('sqlStore', 'taskStore', 'modalStore')(observer(CreateModal));