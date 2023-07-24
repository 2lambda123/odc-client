import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import React from 'react';

const columns = [
  {
    dataIndex: 'tableName',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.ArchiveRange.TableName' }), //表名
    ellipsis: true,
    width: 190,
  },
  {
    dataIndex: 'conditionExpression',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.ArchiveRange.FilterConditions' }), //过滤条件
    ellipsis: true,
    width: 150,
  },
];

const ArchiveRange: React.FC<{
  tables: {
    conditionExpression: string;
    tableName: string;
  }[];
}> = (props) => {
  const { tables } = props;
  return (
    <DisplayTable
      rowKey="id"
      columns={columns}
      dataSource={tables}
      scroll={null}
      disablePagination
    />
  );
};

export default ArchiveRange;
