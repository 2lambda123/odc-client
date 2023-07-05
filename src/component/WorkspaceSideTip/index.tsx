import { getTutorialList } from '@/common/network/other';
import SideTip from '@/component/SideTip';
import { openTutorialPage } from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Dropdown, List, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

import CapSvg from '@/svgr/Cap.svg';
import tracert from '@/util/tracert';

const { Paragraph } = Typography;

const WorkspaceSideTip: React.FC<any> = function () {
  const [visible, setVisible] = useState(false);
  const { data: tutorialList, loading } = useRequest(getTutorialList);
  useEffect(() => {
    if (visible) {
      tracert.expo('c114251');
    }
  }, [visible]);
  const content = (
    <div className={styles.content}>
      <div className={styles.contentHeader}>
        <div className={styles.contentHeaderTitle}>
          {
            formatMessage({
              id: 'odc.component.WorkspaceSideTip.WelcomeToTheOceanbaseTutorial',
            }) /*欢迎使用 OceanBase 教程中心*/
          }
        </div>
        <div className={styles.contentHeaderDesc}>
          {
            formatMessage({
              id: 'odc.component.WorkspaceSideTip.GetStartedWithDistributedDatabases',
            }) /*快速入门分布式数据库，掌握 OceanBase 核心能力*/
          }
        </div>
      </div>
      <div className={styles.contentBody}>
        <List
          itemLayout="horizontal"
          dataSource={tutorialList || []}
          loading={loading}
          rowKey={'id'}
          renderItem={(item) => {
            return (
              <List.Item
                onClick={() => {
                  openTutorialPage(item.id);
                  setVisible(false);
                }}
              >
                <List.Item.Meta
                  title={item.name}
                  description={<Paragraph ellipsis={{ rows: 2 }}>{item.overview}</Paragraph>}
                />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );

  return (
    <Dropdown
      getPopupContainer={() => {
        return document.getElementById('workspace_side_tip');
      }}
      trigger={['click']}
      overlay={content}
      placement="topRight"
      open={visible}
      onOpenChange={(v) => {
        setVisible(v);
      }}
    >
      <SideTip
        style={{ zIndex: 100 }}
        id="workspace_side_tip"
        size="default"
        type="primary"
        icon={<CapSvg />}
        open={visible}
      />
    </Dropdown>
  );
};

export default WorkspaceSideTip;
