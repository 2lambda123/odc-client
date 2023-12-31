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

import { ConnectionPropertyType } from '@/d.ts/datasource';

import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import { SessionParamsPage } from '@/store/helper/page/pages';
import { Layout } from 'antd';
import SessionContextWrap from '../SessionContextWrap';
import SessionParamsTable from './SessionParamsTable';
const { Content } = Layout;

interface IProps {
  params: SessionParamsPage['pageParams'];
}

function SessionParam({ sessionId }: { sessionId: string }) {
  return (
    <>
      <Content
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <SessionParamsTable
            showDatasource
            tip={null}
            sessionId={sessionId}
            connectionPropertyType={ConnectionPropertyType.GLOBAL}
          />
        </div>
      </Content>
    </>
  );
}

export default function SessionParamPage(props: Omit<IProps, 'sessionId'>) {
  return (
    <SessionContextWrap
      defaultDatabaseId={null}
      defaultDatasourceId={props.params?.cid}
      datasourceMode
    >
      {({ session }) => {
        return session ? (
          <SessionParam {...props} sessionId={session?.sessionId} />
        ) : (
          <WorkSpacePageLoading />
        );
      }}
    </SessionContextWrap>
  );
}
