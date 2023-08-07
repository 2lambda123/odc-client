import { getShadowSyncAnalysisRecordResult } from '@/common/network/task';
import MonacoEditor from '@/component/MonacoEditor';
import SimpleTextItem from '@/component/SimpleTextItem';
import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Drawer, Row, Space, Spin } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { IShadowSyncAnalysisResult } from '../../interface';

export interface IViewRef {
  open: (record: IShadowSyncAnalysisResult['tables'][number]) => void;
}

const RecordSQLView = forwardRef<any, { taskId: string; connectionMode: ConnectionMode }>(function (
  { taskId, connectionMode },
  ref,
) {
  const [visiable, setVisiable] = useState(false);
  const { loading, run: runGetShadowSyncAnalysisRecordResult } = useRequest(
    getShadowSyncAnalysisRecordResult,
    {
      manual: true,
    },
  );

  const [record, setRecord] = useState<IShadowSyncAnalysisResult['tables'][number]>(null);
  async function getDDL(recordId: number) {
    if (!recordId || !taskId) {
      return;
    }
    const result = await runGetShadowSyncAnalysisRecordResult(taskId, recordId);
    if (result) {
      setRecord(result);
    }
  }

  useImperativeHandle<any, IViewRef>(
    ref,
    () => {
      return {
        open(record) {
          getDDL(record?.id);
          setVisiable(true);
        },
      };
    },
    [taskId],
  );

  return (
    <Drawer
      width={520}
      title={formatMessage({
        id: 'odc.StructConfigPanel.RecordSQLView.StructuralAnalysisDetails',
      })} /*结构分析详情*/
      visible={visiable}
      onClose={() => {
        setVisiable(false);
        setRecord(null);
      }}
    >
      <Spin spinning={loading}>
        <Space style={{ width: '100%' }} direction="vertical">
          <div>
            <Row>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.StructConfigPanel.RecordSQLView.SourceTableStructure',
                })}
                /*源表结构*/ content={record?.originTableName}
              />
            </Row>
            <div
              style={{
                height: 280,
                border: '1px solid var(--odc-border-color)',
                position: 'relative',
              }}
            >
              <MonacoEditor value={record?.originTableDDL} readOnly language={connectionMode} />
            </div>
          </div>
          <div>
            <Row>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.StructConfigPanel.RecordSQLView.ShadowTableStructure',
                })}
                /*影子表结构*/ content={record?.destTableName}
              />
            </Row>
            <div
              style={{
                height: 280,
                border: '1px solid var(--odc-border-color)',
                position: 'relative',
              }}
            >
              <MonacoEditor value={record?.destTableDDL} readOnly language={connectionMode} />
            </div>
          </div>
          <div>
            <Row>
              {
                formatMessage({
                  id: 'odc.StructConfigPanel.RecordSQLView.StructureChangeSql',
                }) /*结构变更SQL*/
              }
            </Row>
            <div
              style={{
                height: 280,
                border: '1px solid var(--odc-border-color)',
                position: 'relative',
              }}
            >
              <MonacoEditor value={record?.comparingDDL} readOnly language={connectionMode} />
            </div>
          </div>
        </Space>
      </Spin>
    </Drawer>
  );
});

export default RecordSQLView;
