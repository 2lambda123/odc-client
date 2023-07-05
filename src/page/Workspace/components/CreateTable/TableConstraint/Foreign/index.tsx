import Toolbar from '@/component/Toolbar';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TableForeignConstraint } from '../../interface';
import TableCardLayout from '../../TableCardLayout';
import TableContext from '../../TableContext';

import { listDatabases } from '@/common/network/database';
import {
  TableConstraintDefer,
  TableForeignConstraintOnDeleteType,
  TableForeignConstraintOnUpdateType,
} from '@/d.ts/table';
import { DataGridRef } from '@alipay/ob-react-data-grid';
import { useRequest } from 'ahooks';
import { clone } from 'lodash';
import EditableTable from '../../../EditableTable';
import EditToolbar from '../../EditToolbar';
import { removeGridParams } from '../../helper';
import { useColumns } from './columns';

const defaultForeignConstraint: TableForeignConstraint = {
  name: null,
  columns: [],
  schemaname: null,
  tableName: null,
  parentColumns: null,
  onDelete: TableForeignConstraintOnDeleteType.CASCADE,
  onUpdate: TableForeignConstraintOnUpdateType.NO_ACTION,
  enable: true,
  defer: TableConstraintDefer.NOT,
};

interface IProps {
  modified?: boolean;
}

const ForeignConstraint: React.FC<IProps> = function ({ modified }) {
  const tableContext = useContext(TableContext);
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const { data, run } = useRequest(listDatabases, {
    manual: true,
  });
  useEffect(() => {
    run(null, tableContext?.session?.connection?.id, 1, 999);
  }, [tableContext?.session]);
  const gridColumns: any[] = useColumns(
    tableContext.columns,
    data?.contents || [],
    tableContext?.session?.connection?.dialectType,
  );
  const gridRef = useRef<DataGridRef>();
  const rows = useMemo(() => {
    return tableContext.foreignConstraints.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [tableContext.foreignConstraints]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar modified={modified}>
          <Toolbar>
            <Toolbar.Button
              text={formatMessage({ id: 'workspace.header.create' })}
              icon={PlusOutlined}
              onClick={() => {
                tableContext.setForeignConstraints(
                  tableContext.foreignConstraints.concat(defaultForeignConstraint),
                );
              }}
            />
            <Toolbar.Button
              text={formatMessage({ id: 'odc.TableConstraint.Primary.Delete' })}
              icon={DeleteOutlined}
              disabled={!selectedRowsIdx?.length}
              onClick={() => {
                let newRows = [...rows]?.filter((row, index) => {
                  return !selectedRowsIdx?.includes(index);
                });
                tableContext.setForeignConstraints(removeGridParams(newRows));
              }}
            />
          </Toolbar>
        </EditToolbar>
      }
    >
      <EditableTable
        rowKey="key"
        bordered={false}
        minHeight="100%"
        columns={gridColumns}
        enableFilterRow
        rows={rows as any[]}
        enableRowRecord={true}
        enableColumnRecord={false}
        enableSortRow={false}
        onSelectChange={(keys) => {
          setSelectedRowIdx(
            keys.map((key) => {
              return rows.findIndex((row) => row.key === key);
            }),
          );
        }}
        gridRef={gridRef}
        onRowsChange={(rows, data) => {
          const newRows: any[] = clone(rows);
          tableContext.setForeignConstraints(removeGridParams(newRows));
        }}
      />
    </TableCardLayout>
  );
};

export default ForeignConstraint;
