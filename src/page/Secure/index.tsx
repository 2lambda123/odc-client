import { getUserList } from '@/common/network/manager';
import { canAcess, createPermission } from '@/component/Acess';
import PageContainer, { TitleType } from '@/component/PageContainer';
import {
  actionTypes,
  IManagerResourceType,
  IManagerUser,
  IManageUserListParams,
  IResponseData,
} from '@/d.ts';
import { IPageType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import { history, useParams } from 'umi';
import Approval from './Approval';
import { ManageContext } from './context';
import Env from './Env';
import MaskingAlgorithm from './MaskingAlgorithm';
import Record from './Record';
import RiskDetectRules from './RiskDetectRules';
import RiskLevel from './RiskLevel';

interface IProps {
  userStore?: UserStore;
}

const Pages = {
  [IPageType.Secure_Env]: {
    component: Env, // 环境
  },
  [IPageType.Secure_Record]: {
    component: Record, // 操作记录
  },
  [IPageType.RiskDetectRules]: {
    component: RiskDetectRules, // 风险识别规则
  },
  [IPageType.MaskingAlgorithm]: {
    component: MaskingAlgorithm,
  },
  [IPageType.Secure_Approval]: {
    component: Approval, // 审批流程
  },
  [IPageType.RiskLevel]: {
    component: RiskLevel, // 风险等级
  },
};

const tabs = [
  {
    tab: formatMessage({ id: 'odc.page.Secure.Environment' }), //环境
    key: IPageType.Secure_Env,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.RiskLevel' }), //风险等级
    key: IPageType.RiskLevel,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.RiskIdentificationRules' }), //风险识别规则
    key: IPageType.RiskDetectRules,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.ApprovalProcess' }), //审批流程
    key: IPageType.Secure_Approval,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.DesensitizationAlgorithm' }), //脱敏算法
    key: IPageType.MaskingAlgorithm,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.OperationRecord' }), //操作记录
    key: IPageType.Secure_Record,
    permission: createPermission(IManagerResourceType.odc_audit_event, actionTypes.read),
  },
];

const Index: React.FC<IProps> = function ({ userStore }) {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/secure/${key}`);
  };

  const [users, setUsers] = useState<IResponseData<IManagerUser>>(null);
  const _getUserList = async (params: IManageUserListParams) => {
    const users = await getUserList(params);
    setUsers(users);
  };

  const displayTabs = tabs?.filter((tab) => (tab.permission ? canAcess(tab.permission) : true));

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: formatMessage({ id: 'odc.page.Secure.SafetySpecifications' }), //安全规范
      }}
      containerWrapStyle={
        [IPageType.Secure_Env, IPageType.RiskDetectRules, IPageType.RiskLevel].includes(page)
          ? {
              padding: '0px 12px',
            }
          : {}
      }
      tabList={displayTabs}
      tabActiveKey={page}
      onTabChange={handleChange}
    >
      <ManageContext.Provider
        value={{
          users,
          getUserList: _getUserList,
        }}
      >
        <Component id={id} key={id} />
      </ManageContext.Provider>
    </PageContainer>
  );
};
export default inject('userStore', 'settingStore', 'taskStore', 'modalStore')(observer(Index));
// export default Index;
