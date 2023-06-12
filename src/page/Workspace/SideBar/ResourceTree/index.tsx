import Reload from '@/component/Button/Reload';
import { IDatabase } from '@/d.ts/database';
import { SessionManagerStore } from '@/store/sessionManager';
import { Input, Tree } from 'antd';
import { EventDataNode } from 'antd/lib/tree';
import { throttle } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadNode } from './helper';
import styles from './index.less';
import { DataBaseTreeData } from './Nodes/database';
import TreeNodeMenu from './TreeNodeMenu';
import { ResourceNodeType, TreeDataNode } from './type';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  databases: IDatabase[];
  title: string;
  databaseFrom: 'datasource' | 'project';
}

const ResourceTree: React.FC<IProps> = function ({
  sessionManagerStore,
  databases,
  title,
  databaseFrom,
}) {
  const [databaseSessions, setDatabaseSessions] = useState<Record<string, string>>({});
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const treeWrapperRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const resizeHeight = throttle(() => {
      setWrapperHeight(treeWrapperRef?.current?.offsetHeight);
    }, 500);
    setWrapperHeight(treeWrapperRef.current?.clientHeight);
    window.addEventListener('resize', resizeHeight);
    return () => {
      window.removeEventListener('resize', resizeHeight);
    };
  }, []);

  const treeData: TreeDataNode[] = (() => {
    const root = databases?.map((database) => {
      const dbName = database.name;
      const dbSessionId = databaseSessions[dbName];
      const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
      return DataBaseTreeData(dbSession, database, database?.id);
    });
    return root || [];
  })();

  const filteredTreeData = useMemo(() => {
    if (!searchValue || !searchValue?.trim()) {
      return treeData;
    }
    return treeData.filter((dbNode) => {
      let haveObj = false;
      dbNode.children?.forEach((objRootNode: TreeDataNode) => {
        let filterChildren: any = objRootNode.children?.filter((objNode) => {
          return objNode.title?.toString()?.toLowerCase()?.includes(searchValue?.toLowerCase());
        });
        objRootNode.children = filterChildren;
        if (filterChildren?.length) {
          haveObj = true;
        }
      });
      if (haveObj) {
        return true;
      }
    });
  }, [treeData, searchValue]);

  const loadData = useCallback(
    async (treeNode: EventDataNode<any> & TreeDataNode) => {
      const { type, data } = treeNode;
      switch (type) {
        case ResourceNodeType.Database: {
          const dbName = (data as IDatabase).name;
          const dbSession = await sessionManagerStore.createSession(null, data?.id);
          setDatabaseSessions({
            ...databaseSessions,
            [dbName]: dbSession.sessionId,
          });
          break;
        }
        default: {
          await loadNode(sessionManagerStore, treeNode);
        }
      }
    },
    [databaseSessions],
  );

  const renderNode = useCallback(
    (node: TreeDataNode): React.ReactNode => {
      const { type, sessionId, key, dbObjectType } = node;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);

      return (
        <TreeNodeMenu node={node} dbSession={dbSession} type={type} databaseFrom={databaseFrom} />
      );
    },
    [databaseSessions],
  );

  return (
    <div className={styles.resourceTree}>
      <div className={styles.title}>
        <span className={styles.label}>{title}</span>
        <span>
          <Reload />
        </span>
      </div>
      <div className={styles.search}>
        <Input.Search
          onSearch={(v) => setSearchValue(v)}
          size="small"
          placeholder="搜索已加载对象"
        />
      </div>
      <div ref={treeWrapperRef} className={styles.tree}>
        <Tree
          defaultExpandedKeys={[]}
          showIcon
          filterTreeNode={(node) =>
            node.title.toString().toLowerCase().includes(searchValue?.toLowerCase())
          }
          treeData={filteredTreeData}
          titleRender={renderNode}
          loadData={loadData}
          height={wrapperHeight}
          selectable={false}
        />
      </div>
    </div>
  );
};

export default inject('sessionManagerStore')(observer(ResourceTree));
