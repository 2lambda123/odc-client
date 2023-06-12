import Icon from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { ReactElement, useRef, useState } from 'react';

import styles from './index.less';

interface IActionProps {
  onAction: (key: string) => void;
}

export interface ITab {
  title: string;
  key: string;
  actions: {
    title: string;
    icon: React.ComponentType;
    key: string;
    onClick: () => void;
  }[];
  render: () => ReactElement;
}

interface IProps {
  tabs: ITab[];
}

export default function SideTabs({ tabs }: IProps) {
  const [selectTabKey, setSelectTabKey] = useState<string>(tabs?.[0]?.key);
  const loadedKeys = useRef<Set<string>>(new Set());
  const selectTab: ITab = tabs.find((tab) => tab.key === selectTabKey);
  loadedKeys.current.add(selectTabKey);

  return (
    <div className={styles.sidetabs}>
      <div className={styles.header}>
        <Space size={12} className={styles.tabs}>
          {tabs.map((tab) => {
            const isSelect = tab.key === selectTabKey;
            return (
              <div
                onClick={() => {
                  if (isSelect) {
                    return;
                  }
                  setSelectTabKey(tab.key);
                }}
                className={classNames(styles.tab, { [styles.select]: isSelect })}
              >
                {tab.title}
              </div>
            );
          })}
        </Space>
        <Space size={10} className={styles.actions}>
          {selectTab?.actions?.map((action) => {
            return (
              <Tooltip title={action.title}>
                <Icon
                  onClick={action.onClick}
                  className={styles.acion}
                  component={action.icon}
                  key={action.key}
                />
              </Tooltip>
            );
          })}
        </Space>
      </div>
      <div className={styles.content}>
        {tabs
          .map((tab) => {
            if (loadedKeys.current.has(tab.key) || selectTab.key === tab.key) {
              return (
                <div
                  key={tab.key}
                  className={styles.component}
                  style={{ zIndex: selectTab.key === tab.key ? 'unset' : -9999 }}
                >
                  {tab?.render?.()}
                </div>
              );
            }
            return null;
          })
          .filter(Boolean)}
      </div>
    </div>
  );
}
