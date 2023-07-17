import { IOrganization } from '@/d.ts';
import { UserStore } from '@/store/login';
import Icon from '@ant-design/icons';
import { Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { history } from 'umi';
import styles from './index.less';

import { SpaceType } from '@/d.ts/_index';
import PersonalSvg from '@/svgr/personal_space.svg';
import GroupSvg from '@/svgr/project_space.svg';

interface IProps {
  userStore?: UserStore;
}
const SpaceSelectModal: React.FC<IProps> = ({ userStore }) => {
  const visible = true;

  const { user } = userStore;

  const handleGoto = (value: string) => {
    history.push(value);
  };

  const switchOriganization = async (id: number, type: IOrganization['type']) => {
    const isSuccess = await userStore.switchCurrentOrganization(id);
    if (isSuccess) {
      type === SpaceType.PRIVATE ? handleGoto('/sqlworkspace') : handleGoto('/project');
    }
  };

  return (
    <Modal
      width={720}
      footer={null}
      closable={false}
      visible={visible}
      wrapClassName={styles['space-modal']}
    >
      <div className={styles.header}>
        <h2>选择你的工作空间</h2>
        <p className={styles.desc}>可在个人设置中切换，此处的选择不影响正常使用</p>
      </div>
      <div className={styles.footer}>
        {userStore.organizations?.map((ori) => {
          if (ori.type === 'TEAM') {
            return (
              <Space
                className={styles.item}
                direction="vertical"
                size={12}
                onClick={() => switchOriganization(ori.id, ori.type)}
              >
                <div className={styles.synergy}>
                  <Icon component={GroupSvg} />
                </div>
                <span className={styles.label}>{ori.displayName}</span>
                <span className={styles.desc}>{ori.description}</span>
              </Space>
            );
          }
          return (
            <Space
              className={styles.item}
              direction="vertical"
              size={12}
              onClick={() => switchOriganization(ori.id, ori.type)}
            >
              <div className={styles.private}>
                <Icon component={PersonalSvg} />
              </div>
              <span className={styles.label}>{ori.displayName}</span>
              <span className={styles.desc}>{ori.description}</span>
            </Space>
          );
        })}
      </div>
    </Modal>
  );
};

export default inject('userStore')(observer(SpaceSelectModal));
