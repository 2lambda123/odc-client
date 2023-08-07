import { getTaskExecStrategyMap } from '@/component/Task';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { isCycleTriggerStrategy } from '@/component/Task/helper';
import type { CycleTaskDetail, IDataArchiveJobParameters, TaskOperationType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, Space, Typography } from 'antd';
import React from 'react';
import styles from '../../index.less';
import { InsertActionOptions } from '../CreateModal';
import ArchiveRange from './ArchiveRange';
import VariableConfig from './VariableConfig';

const { Text } = Typography;
const { Panel } = Collapse;

interface IProps {
  task: CycleTaskDetail<IDataArchiveJobParameters>;
  hasFlow: boolean;
  operationType?: TaskOperationType;
}

const DataArchiveTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow } = props;
  const { triggerConfig, jobParameters } = task ?? {};
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const isCycleStrategy = isCycleTriggerStrategy(triggerConfig?.triggerStrategy);
  const insertActionLabel = InsertActionOptions?.find(
    (item) => item.value === jobParameters?.migrationInsertAction,
  )?.label;

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={formatMessage({ id: 'odc.DataArchiveTask.DetailContent.TaskNumber' })} /*任务编号*/
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({ id: 'odc.DataArchiveTask.DetailContent.TaskType' })} /*任务类型*/
        >
          {formatMessage({ id: 'odc.DataArchiveTask.DetailContent.DataArchiving' }) /*数据归档*/}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.SourceDatabase',
          })} /*源数据库*/
        >
          <Space size={2}>
            <span>{jobParameters?.sourceDatabaseName}</span>
            <Text type="secondary">{jobParameters?.sourceDataSourceName}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.TargetDatabase',
          })} /*目标数据库*/
        >
          <Space size={2}>
            <span>{jobParameters?.targetDatabaseName}</span>
            <Text type="secondary">{jobParameters?.targetDataSourceName}</Text>
          </Space>
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.DataArchiveTask.DetailContent.RiskLevel',
            })} /*风险等级*/
          >
            {task?.riskLevel}
          </Descriptions.Item>
        )}
      </Descriptions>

      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataArchiveTask.DetailContent.VariableConfiguration',
        })} /*变量配置*/
        content={
          <div style={{ margin: '8px 0 12px' }}>
            <VariableConfig variables={jobParameters?.variables} />
          </div>
        }
        direction="column"
      />

      <SimpleTextItem
        label={formatMessage({ id: 'odc.DataArchiveTask.DetailContent.ArchiveScope' })} /*归档范围*/
        content={
          <div style={{ margin: '8px 0 12px' }}>
            <ArchiveRange tables={jobParameters?.tables} />
          </div>
        }
        direction="column"
      />

      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.CleanUpArchivedDataFrom',
          })} /*清理源端已归档的数据*/
        >
          {
            jobParameters?.deleteAfterMigration
              ? formatMessage({ id: 'odc.DataArchiveTask.DetailContent.Yes' }) //是
              : formatMessage({ id: 'odc.DataArchiveTask.DetailContent.No' }) //否
          }
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.ExecutionMethod',
          })} /*执行方式*/
        >
          {taskExecStrategyMap[triggerConfig.triggerStrategy]}
        </Descriptions.Item>
        {isCycleStrategy && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.DataArchiveTask.DetailContent.NextExecutionTime',
                  })} /*下一次执行时间*/
                  content={
                    <Space>
                      {getFormatDateTime(task.nextFireTimes?.[0])}
                      {isActive ? <UpOutlined /> : <DownOutlined />}
                    </Space>
                  }
                />
              )}
            >
              <Panel key="1" header={null}>
                <Space direction="vertical" size={0}>
                  {task?.nextFireTimes?.map((item, index) => {
                    return index > 0 && <div>{getFormatDateTime(item)}</div>;
                  })}
                </Space>
              </Panel>
            </Collapse>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="插入策略" span={isCycleStrategy ? 2 : 1}>
          {insertActionLabel || '-'}
        </Descriptions.Item>

        <Descriptions.Item
          label={formatMessage({ id: 'odc.DataArchiveTask.DetailContent.Remarks' })}
          /*备注*/ span={2}
        >
          {task?.description || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ marginTop: 4 }} />
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({ id: 'odc.DataArchiveTask.DetailContent.Founder' })} /*创建人*/
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.CreationTime',
          })} /*创建时间*/
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default DataArchiveTaskContent;
