/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { listProjects } from '@/common/network/project';
import { Acess, createPermission } from '@/component/Acess';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import Search from '@/component/Input/Search';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IProject } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { formatMessage } from '@/util/intl';
import { useNavigate } from '@umijs/max';
import { Empty, List, Space, Spin } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import CreateProjectDrawer from './CreateProject/Drawer';
import styles from './index.less';
import ListItem from './ListItem';
import { setDefaultProject } from '@/service/projectHistory';

const titleOptions: { label: string; value: 'all' | 'deleted' }[] = [
  {
    label: formatMessage({ id: 'odc.Project.Project.AllProjects' }), //全部项目
    value: 'all',
  },
  {
    label: formatMessage({ id: 'odc.Project.Project.ArchiveProject' }), //归档项目
    value: 'deleted',
  },
];

const Project = () => {
  const domRef = useRef<HTMLDivElement>();
  const [currentPage, setCurrentPage] = useState(0);
  const [dataSource, setDataSource] = useState<IProject[]>([]);
  const [projectSearchName, setProjectSearchName] = useState(null);
  const [projectType, setProjectType] = useState<'all' | 'deleted'>('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isProjectDeleted = projectType === 'deleted';

  const appendData = async (currentPage, dataSource, projectType, projectSearchName) => {
    setLoading(true);
    try {
      const isProjectDeleted = projectType === 'deleted';
      const res = await listProjects(projectSearchName, currentPage + 1, 40, isProjectDeleted);
      if (res) {
        setCurrentPage(currentPage + 1);
        /**
         * 去除重复
         */
        const existIds = new Set();
        dataSource.forEach((item) => existIds.add(item.id));

        setDataSource(dataSource.concat(res?.contents.filter((item) => !existIds.has(item.id))));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  function reload(newProjectType?: string, projectSearchName?: string) {
    setCurrentPage(0);
    setDataSource([]);
    appendData(0, [], newProjectType || projectType, projectSearchName);
  }

  useEffect(() => {
    appendData(currentPage, dataSource, projectType, projectSearchName);
  }, []);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === domRef.current?.clientHeight) {
      appendData(currentPage, dataSource, projectType, projectSearchName);
    }
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TAB,
        options: titleOptions,
        showDivider: true,
        defaultValue: projectType,
      }}
      onTabChange={(v: 'all' | 'deleted') => {
        setProjectType(v);
        reload(v);
      }}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            <Acess
              fallback={<span></span>}
              {...createPermission(IManagerResourceType.project, actionTypes.create)}
            >
              <CreateProjectDrawer disabled={isProjectDeleted} onCreate={() => reload()} />
            </Acess>
            <Space size={12}>
              <Search
                onSearch={(v) => {
                  setProjectSearchName(v);
                  reload(null, v);
                }}
                searchTypes={[
                  {
                    label: formatMessage({ id: 'odc.Project.Project.ProjectName' }), //项目名称
                    value: 'projectName',
                  },
                ]}
              />

              <FilterIcon onClick={() => reload()}>
                <Reload />
              </FilterIcon>
            </Space>
          </div>
        }
      >
        <div ref={domRef} style={{ height: '100%' }}>
          {dataSource?.length ? (
            <VirtualList
              data={dataSource}
              height={domRef.current?.clientHeight}
              itemHeight={40}
              itemKey="id"
              onScroll={onScroll}
            >
              {(item) => (
                <ListItem
                  onClick={(p) => {
                    if (isProjectDeleted) {
                      return;
                    }
                    setDefaultProject(p.id);
                    navigate(`/project/${p.id}/${IPageType.Project_Database}`);
                  }}
                  data={item}
                />
              )}
            </VirtualList>
          ) : (
            <Spin spinning={loading}>
              <Empty />
            </Spin>
          )}
        </div>
      </List>
    </PageContainer>
  );
};

export default Project;
