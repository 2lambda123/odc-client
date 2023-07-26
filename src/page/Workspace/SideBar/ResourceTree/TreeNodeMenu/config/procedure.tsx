import { deleteProcedure, getProcedureByProName } from '@/common/network';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { ConnectionMode, DbObjectType, IProcedure, PageType } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/ProcedurePage';
import {
  openBatchCompilePLPage,
  openProcedureEditPageByProName,
  openProcedureViewPage,
} from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import BatchCompileSvg from '@/svgr/batch-compile-all.svg';
import { triggerActionAfterPLPageCreated } from '@/util/events';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const procedureMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.ProcedureRoot]: [
    {
      key: 'BATCH_COMPILE',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.procedure.BatchCompilation' }), //批量编译
      ],
      actionType: actionTypes.create,
      icon: BatchCompileSvg,
      isHide(session, node) {
        const isMySQL = session.connection.dialectType === ConnectionMode.OB_MYSQL;
        return isMySQL;
      },
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_PROCEDURE,
          DbObjectType.procedure,
          formatMessage({ id: 'odc.components.ResourceTree.StoredProcedure' }),
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'CREATE',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.procedure.CreateAStoredProcedure' }), //新建存储过程
      ],
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateProcedureModalVisible(
          true,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getProcedureList();
      },
    },
  ],

  [ResourceNodeType.Procedure]: [
    {
      key: 'OVERVIEW',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],

      ellipsis: true,
      run(session, node) {
        const proc: IProcedure = node.data;
        openProcedureViewPage(
          proc?.proName,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'EDIT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
      ],
      ellipsis: true,
      actionType: actionTypes.update,
      async run(session, node) {
        const proc: IProcedure = node.data;
        await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
      },
    },
    {
      key: 'COMPILE',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
      ],
      ellipsis: true,
      isHide(session, node) {
        const isMySQL = session.connection.dialectType === ConnectionMode.OB_MYSQL;
        return isMySQL;
      },
      async run(session, node) {
        const proc: IProcedure = node.data;
        const { plPage, isNew } = await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
        triggerActionAfterPLPageCreated(plPage, 'compile', isNew);
      },
    },
    {
      key: 'DEBUG',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
        }),
      ],

      isHide(session, node) {
        return !session?.supportFeature?.enablePLDebug;
      },
      ellipsis: true,
      async run(session, node) {
        const proc: IProcedure = node.data;
        if (proc.status === 'INVALID') {
          message.info(
            formatMessage({
              id: 'odc.ResourceTree.config.treeNodesActions.InvalidObjectDebuggingIsNot',
            }),
          );

          return;
        }
        const { plPage, isNew } = await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );

        triggerActionAfterPLPageCreated(plPage, 'debug', isNew);
      },
    },
    {
      key: 'RUN',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Run',
        }),
      ],

      ellipsis: true,
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const proc: IProcedure = node.data;
        const { plPage, isNew } = await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );

        triggerActionAfterPLPageCreated(plPage, 'run', isNew);
      },
    },

    {
      key: 'EXPORT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Export' }), //导出
      ],
      ellipsis: true,
      run(session, node) {
        const proc: IProcedure = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.procedure,
          name: proc.proName,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: 'DOWNLOAD',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
      ],
      ellipsis: true,
      hasDivider: true,
      async run(session, node) {
        const proc: IProcedure = node.data;
        const obj = await getProcedureByProName(
          proc?.proName,
          false,
          session?.sessionId,
          session?.database?.dbName,
        );
        const ddl = obj?.ddl;
        if (ddl) {
          downloadPLDDL(proc?.proName, PLType.PROCEDURE, ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: 'DELETE',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
      ],
      ellipsis: true,
      actionType: actionTypes.delete,
      run(session, node) {
        const proc: IProcedure = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createFunction.modal.delete',
            },

            {
              name: proc?.proName,
            },
          ),
          okText: formatMessage({ id: 'app.button.ok' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            await deleteProcedure(proc?.proName, session?.sessionId, session?.database?.dbName);
            await session.database.getProcedureList();

            message.success(
              formatMessage({
                id: 'workspace.window.createProcedure.modal.delete.success',
              }),
            );

            const openedPages = pageStore?.pages.filter(
              (p) =>
                p.title === proc?.proName &&
                (p.type == PageType.PROCEDURE || p.type == PageType.PL),
            );

            if (openedPages?.length) {
              for (let page of openedPages) {
                await pageStore.close(page.key);
              }
            }
          },
        });
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      ellipsis: true,
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getProcedureList();
      },
    },
  ],
};
