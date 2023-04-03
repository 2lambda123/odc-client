import Icon from '@ant-design/icons';

import { PageType } from '@/d.ts';
import CreateTablePage from '@/page/Workspace/components/CreateTable';
import CreateViewPage from '@/page/Workspace/components/CreateViewPage';
import EditPackagePage from '@/page/Workspace/components/EditPackagePage';
import EditPLPage from '@/page/Workspace/components/EditPLPage';
import OBClientPage from '@/page/Workspace/components/OBClientPage';
import PLPage from '@/page/Workspace/components/PLPage';
import RecycleBinPage from '@/page/Workspace/components/RecycleBinPage';
import SessionParamPage from '@/page/Workspace/components/SessionParamPage';
import SQLPage from '@/page/Workspace/components/SQLPage';
import TablePage from '@/page/Workspace/components/TablePage';

import ViewPage from '@/page/Workspace/components/ViewPage';
import withConfirmModal from './factory';
// @ts-ignore
import ConsoleSQLSvg from '@/svgr/Console-SQL.svg';
// @ts-ignore
import ConsolePLSvg from '@/svgr/Console-PL.svg';
// @ts-ignore
import FunctionSvg from '@/svgr/menuFunc.svg';
// @ts-ignore
import ProcedureSvg from '@/svgr/menuProcedure.svg';
// @ts-ignore
import SequenceSvg from '@/svgr/menuSequence.svg';
// @ts-ignore
import PackageSvg from '@/svgr/menuPkg.svg';
// @ts-ignore
import TriggerSvg from '@/svgr/menuTrigger.svg';
// @ts-ignore
import SynonymSvg from '@/svgr/menuSynonym.svg';
// @ts-ignore
import CommandSvg from '@/svgr/command.svg';
import TableOutlined from '@/svgr/menuTable.svg';
import ViewSvg from '@/svgr/menuView.svg';
import DeleteOutlined from '@/svgr/tabRecycle.svg';
import SettingOutlined from '@/svgr/tabSession.svg';

// @ts-ignore
import TypeSvg from '@/svgr/menuType.svg';

import TaskSvg from '@/svgr/icon_task.svg';

import CreateTriggerPage from '@/page/Workspace/components/CreateTriggerPage';
import FunctionPage from '@/page/Workspace/components/FunctionPage';
import PackagePage from '@/page/Workspace/components/PackagePage';
import PLBatchCompilePage from '@/page/Workspace/components/PLBatchCompilePage';
import ProcedurePage from '@/page/Workspace/components/ProcedurePage';
import SequencePage from '@/page/Workspace/components/SequencePage';
import SessionManagementPage from '@/page/Workspace/components/SessionManagementPage';
import SQLConfirmPage from '@/page/Workspace/components/SQLConfirmPage';
import SQLResultSetViewPage from '@/page/Workspace/components/SQLResultSetViewPage';
import SynonymPage from '@/page/Workspace/components/SynonymPage';
import TaskManaerPage from '@/page/Workspace/components/TaskManagePage';
import TriggerPage from '@/page/Workspace/components/TriggerPage';
import TutorialPage from '@/page/Workspace/components/TutorialPage';
import TypePage from '@/page/Workspace/components/TypePage';

/** 页面类型 */
export const pageMap = {
  // SQL 查询页
  [PageType.SQL]: {
    component: withConfirmModal(SQLPage),
    icon: <Icon component={ConsoleSQLSvg} />,
    color: 'var(--icon-color-1)',
    params: {
      scriptType: PageType.SQL,
    },
  },

  // PL 查询页
  [PageType.PL]: {
    component: withConfirmModal(PLPage),
    icon: <Icon component={ConsolePLSvg} />,
    color: 'var(--icon-color-1)',
    params: {
      scriptType: PageType.PL,
    },
  },

  // 表创建页
  [PageType.CREATE_TABLE]: {
    component: withConfirmModal(CreateTablePage),
    icon: <TableOutlined />,
    color: 'var(--icon-color-1)',
  },

  // 表详情页
  [PageType.TABLE]: {
    component: withConfirmModal(TablePage),
    icon: <TableOutlined />,
    color: 'var(--icon-color-1)',
  },

  // 会话参数页
  [PageType.SESSION_PARAM]: {
    component: withConfirmModal(SessionParamPage),
    icon: <SettingOutlined />,
    color: 'var(--icon-color-7)',
  },

  // 会话管理页
  [PageType.SESSION_MANAGEMENT]: {
    component: withConfirmModal(SessionManagementPage),
    icon: <SettingOutlined />,
    color: 'var(--icon-color-7)',
  },

  // 回收站页
  [PageType.RECYCLE_BIN]: {
    component: withConfirmModal(RecycleBinPage),
    icon: <DeleteOutlined />,
    color: 'var(--icon-color-6)',
  },

  // 任务管理
  [PageType.TASKS]: {
    component: withConfirmModal(TaskManaerPage),
    icon: <TaskSvg />,
    color: '#1890FF',
  },

  // 视图创建页
  [PageType.CREATE_VIEW]: {
    component: withConfirmModal(CreateViewPage),
    icon: <Icon component={ViewSvg} />,
    color: 'var(--icon-color-1)',
  },

  // 视图详情页
  [PageType.VIEW]: {
    component: withConfirmModal(ViewPage),
    icon: <Icon component={ViewSvg} />,
    color: 'var(--icon-color-1)',
  },

  // 函数创建页
  [PageType.CREATE_FUNCTION]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={FunctionSvg} />,
    color: 'var(--icon-color-2)',
  },

  // 函数详情页
  [PageType.FUNCTION]: {
    component: withConfirmModal(FunctionPage),
    icon: <Icon component={FunctionSvg} />,
    color: 'var(--icon-color-2)',
  },

  // 存储过程创建页
  [PageType.CREATE_PROCEDURE]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={ProcedureSvg} />,
    color: 'var(--icon-color-2)',
  },

  // 存储过程详情页
  [PageType.PROCEDURE]: {
    component: withConfirmModal(ProcedurePage),
    icon: <Icon component={ProcedureSvg} />,
    color: 'var(--icon-color-2)',
  },

  // 序列创建页
  [PageType.CREATE_SEQUENCE]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={SequenceSvg} />,
    color: 'var(--icon-color-5)',
  },

  // 序列详情页
  [PageType.SEQUENCE]: {
    component: withConfirmModal(SequencePage),
    icon: <Icon component={SequenceSvg} />,
    color: 'var(--icon-color-5)',
  },

  // 包创建页
  [PageType.CREATE_PACKAGE]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={PackageSvg} />,
    color: 'var(--icon-color-3)',
  },

  // 包编辑页
  [PageType.EDIT_PACKAGE]: {
    component: withConfirmModal(EditPackagePage),
    icon: <Icon component={PackageSvg} />,
    color: 'var(--icon-color-3)',
  },

  // 包详情页
  [PageType.PACKAGE]: {
    component: withConfirmModal(PackagePage),
    icon: <Icon component={PackageSvg} />,
    color: 'var(--icon-color-3)',
  },

  // PL 编辑页
  [PageType.EDIT_PL]: {
    component: withConfirmModal(EditPLPage),
    icon: <Icon component={ConsolePLSvg} />,
    color: 'var(--icon-color-1)',
  },

  [PageType.OB_CLIENT]: {
    component: withConfirmModal(OBClientPage),
    icon: <Icon component={CommandSvg} />,
    color: 'var(--icon-color-8)',
  },
  // 触发器创建页
  [PageType.CREATE_TRIGGER]: {
    component: withConfirmModal(CreateTriggerPage),
    icon: <Icon component={TriggerSvg} />,
    color: 'var(--icon-color-3)',
  },

  // 触发器创建SQL确认页
  [PageType.CREATE_TRIGGER_SQL]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={TriggerSvg} />,
    color: 'var(--icon-color-3)',
  },

  // 同义词创建SQL确认页
  [PageType.CREATE_SYNONYM]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={SynonymSvg} />,
    color: 'var(--icon-color-5)',
  },

  // 触发器详情页
  [PageType.TRIGGER]: {
    component: withConfirmModal(TriggerPage),
    icon: <Icon component={TriggerSvg} />,
    color: 'var(--icon-color-3)',
  },

  // 同义词详情页
  [PageType.SYNONYM]: {
    component: withConfirmModal(SynonymPage),
    icon: <Icon component={SynonymSvg} />,
    color: 'var(--icon-color-5)',
  },

  // 类型详情页
  [PageType.TYPE]: {
    component: withConfirmModal(TypePage),
    icon: <Icon component={TypeSvg} />,
    color: 'var(--icon-color-4)',
  },

  // 类型创建SQL确认页
  [PageType.CREATE_TYPE]: {
    component: withConfirmModal(SQLConfirmPage),
    icon: <Icon component={TypeSvg} />,
    color: 'var(--icon-color-4)',
  },
  [PageType.SQL_RESULTSET_VIEW]: {
    component: SQLResultSetViewPage,
    icon: <Icon component={TypeSvg} />,
    color: 'var(--icon-color-4)',
  },

  [PageType.BATCH_COMPILE_FUNCTION]: {
    component: withConfirmModal(PLBatchCompilePage),
    icon: <Icon component={FunctionSvg} />,
    color: '#8750d8',
  },
  [PageType.BATCH_COMPILE_PACKAGE]: {
    component: withConfirmModal(PLBatchCompilePage),
    icon: <Icon component={PackageSvg} />,
    color: '#FAAD14',
  },
  [PageType.BATCH_COMPILE_PROCEDURE]: {
    component: withConfirmModal(PLBatchCompilePage),
    icon: <Icon component={ProcedureSvg} />,
    color: '#52C41A',
  },
  [PageType.BATCH_COMPILE_TRIGGER]: {
    component: withConfirmModal(PLBatchCompilePage),
    icon: <Icon component={TriggerSvg} />,
    color: '#52C41A',
  },
  [PageType.BATCH_COMPILE_TYPE]: {
    component: withConfirmModal(PLBatchCompilePage),
    icon: <Icon component={TypeSvg} />,
    color: '#1890ff',
  },
  [PageType.TUTORIAL]: {
    component: withConfirmModal(TutorialPage),
    icon: <Icon component={ConsoleSQLSvg} />,
    color: '#35CFC9',
    params: {
      scriptType: PageType.SQL,
    },
  },
};
