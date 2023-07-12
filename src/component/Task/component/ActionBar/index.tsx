import {
  createTask,
  downloadTaskFlow,
  executeTask,
  getAsyncResultSet,
  getTaskResult,
  stopTask,
} from '@/common/network/task';
import Action from '@/component/Action';
import {
  ICycleTaskRecord,
  ISqlExecuteResultStatus,
  ITaskResult,
  RollbackType,
  TaskDetail,
  TaskExecStrategy,
  TaskRecord,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import { openSQLResultSetViewPage } from '@/store/helper/page';
import type { UserStore } from '@/store/login';
import type { ModalStore } from '@/store/modal';
import type { SettingStore } from '@/store/setting';
import type { TaskStore } from '@/store/task';
import ipcInvoke from '@/util/client/service';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { downloadFile, getLocalFormatDateTime } from '@/util/utils';
import { message, Modal, Popconfirm, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { isCycleTask } from '../../helper';
import RollBackModal from '../RollbackModal';

interface IProps {
  userStore?: UserStore;
  taskStore?: TaskStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  isDetailModal?: boolean;
  task: Partial<TaskRecord<TaskRecordParameters> | TaskDetail<TaskRecordParameters>>;
  disabledSubmit?: boolean;
  result?: ITaskResult;
  onReloadList: () => void;
  onApprovalVisible: (
    task: Partial<TaskRecord<TaskRecordParameters> | ICycleTaskRecord<any>>,
    status: boolean,
    visible: boolean,
  ) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onClose?: () => void;
}

const ActionBar: React.FC<IProps> = inject(
  'taskStore',
  'userStore',
  'settingStore',
  'modalStore',
)(
  observer((props) => {
    const {
      taskStore,
      userStore: { user },
      settingStore,
      isDetailModal,
      task,
      disabledSubmit = false,
      result,
    } = props;
    const isOwner = user?.id === task?.creator?.id;
    const isApprovable = task?.approvable;
    const [viewLoading, setViewLoading] = useState(false);
    const [activeBtnKey, setActiveBtnKey] = useState(null);
    const [openRollback, setOpenRollback] = useState(false);
    const wrapperRef = useRef(null);
    const disabledApproval =
      task?.status === TaskStatus.WAIT_FOR_CONFIRM && !isDetailModal ? true : disabledSubmit;

    const openTaskDetail = async () => {
      props.onDetailVisible(task as TaskRecord<TaskRecordParameters>, true);
    };

    const closeTaskDetail = async () => {
      props.onDetailVisible(null, false);
    };

    const resetActiveBtnKey = () => {
      setActiveBtnKey(null);
    };

    const _stopTask = async () => {
      setActiveBtnKey('stop');
      const res = await stopTask(task.id);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.components.TaskManagePage.TerminatedSuccessfully',
          }),
        );

        props.onReloadList();
      }
    };

    const download = async () => {
      downloadTaskFlow(task.id);
    };

    const downloadViewResult = async () => {
      downloadFile(result?.zipFileDownloadUrl);
    };

    const handleCopy = () => {};

    const confirmRollback = async (type: RollbackType) => {
      closeTaskDetail();
      props.modalStore.changeCreateAsyncTaskModal(true, {
        type,
        task,
        objectId: result?.rollbackPlanResult?.objectId,
      });
    };

    useEffect(() => {
      if (activeBtnKey) {
        resetActiveBtnKey();
      }
    }, [task?.status]);

    const handleRollback = async () => {
      setOpenRollback(true);
    };

    const handleCloseRollback = async () => {
      setOpenRollback(false);
    };

    const handleExecute = async () => {
      const res = await executeTask(task.id);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.TaskManagePage.component.TaskTools.ExecutionSucceeded',
          }),

          //执行成功
        );
      }
    };

    const handleApproval = async (status: boolean) => {
      props.onApprovalVisible(task as TaskRecord<TaskRecordParameters>, status, true);
    };

    const handleReTry = async () => {
      const { type, databaseId, executionStrategy, executionTime, parameters } = task;
      const res = await createTask({
        taskType: type,
        databaseId,
        executionStrategy,
        executionTime,
        parameters,
      });

      if (res) {
        message.success(
          formatMessage({
            id: 'odc.TaskManagePage.component.TaskTools.InitiatedAgain',
          }),

          //再次发起成功
        );
      }
    };

    const viewResult = async () => {
      setViewLoading(true);
      try {
        const resultSets = await getAsyncResultSet(task.id);
        if (resultSets) {
          /**
           * 没有成功的请求的话，这里就不去展示结果了。
           */

          const haveSuccessQuery = !!resultSets?.find(
            (result) => result.status === ISqlExecuteResultStatus.SUCCESS && result.columns?.length,
          );

          if (!haveSuccessQuery) {
            message.warn(
              formatMessage({
                id: 'odc.TaskManagePage.component.TaskTools.NoResultsToView',
              }),
              //无可查看的结果信息
            );
            return;
          }
          // TODO: 跳转过去，显示的信息待确定，暂时使用id占位
          await openSQLResultSetViewPage(task.id, resultSets);
          taskStore.changeTaskManageVisible(false);
          props.onDetailVisible(null, false);
        }
      } finally {
        setViewLoading(false);
      }
    };

    const editCycleTask = async () => {
      props?.onClose?.();
      props.modalStore.changeCreateSQLPlanTaskModal(true, task?.id);
    };

    const disableCycleTask = async () => {
      const { databaseId, id } = task;
      Modal.confirm({
        title: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.AreYouSureYouWant.1',
        }), //确认要禁用此 SQL 计划吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.DisableSqlScheduling',
                }) /*禁用 SQL 计划*/
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe',
                }) /*任务需要重新审批，审批通过后此任务将禁用*/
              }
            </div>
          </>
        ),

        cancelText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        }), //取消
        okText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Ok.2',
        }), //确定
        centered: true,
        onOk: async () => {
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: id,
              operationType: 'PAUSE',
            },
          });
        },
      });
    };

    const enableCycleTask = async () => {
      const { databaseId, id } = task;
      Modal.confirm({
        title: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.AreYouSureYouWant.2',
        }), //确认要启用此 SQL 计划吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.EnableSqlScheduling',
                }) /*启用 SQL 计划*/
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTools.TheTaskNeedsToBe.1',
                }) /*任务需要重新审批，审批通过后此任务将启用*/
              }
            </div>
          </>
        ),

        cancelText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Cancel',
        }), //取消
        okText: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Ok.2',
        }), //确定
        centered: true,
        onOk: async () => {
          await createTask({
            databaseId,
            taskType: TaskType.ALTER_SCHEDULE,
            parameters: {
              taskId: id,
              operationType: 'RESUME',
            },
          });
        },
      });
    };

    const stopCycleTask = async () => {
      const { databaseId, id } = task;
      await createTask({
        databaseId,
        taskType: TaskType.ALTER_SCHEDULE,
        parameters: {
          taskId: id,
          operationType: 'TERMINATION',
        },
      });
    };

    const getTaskTools = (_task) => {
      let tools = [];

      if (!_task) {
        return [];
      }
      const { status } = _task;

      const viewBtn = {
        key: 'view',
        text: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.See' }), // 查看
        action: openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      };

      const closeBtn = {
        key: 'close',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Close',
        }),

        //关闭
        action: closeTaskDetail,
        type: 'button',
      };

      const copyBtn = {
        key: 'copy',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Copy',
        }),

        //复制
        action: handleCopy,
        type: 'button',
        isOpenBtn: true,
      };

      const rollbackBtn = {
        key: 'rollback',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.RollBack',
        }),

        //回滚
        action: handleRollback,
        type: 'button',
      };

      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Terminate',
        }),

        //终止
        action: _stopTask,
        type: 'button',
      };

      const executeBtn = {
        key: 'execute',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Run',
        }),

        //执行
        type: 'button',
        action: handleExecute,
        isOpenBtn: true,
        isPrimary: isDetailModal,
        disabled: false,
        tooltip: '',
      };

      const approvalBtn = {
        key: 'approval',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Pass',
        }),

        //通过
        type: 'button',
        isPrimary: isDetailModal,
        disabled: disabledApproval,
        tooltip: disabledApproval
          ? formatMessage({
              id: 'odc.TaskManagePage.component.TaskTools.SetPartitionPoliciesForAll',
            })
          : //请设置所有Range分区表的分区策略
            null,
        action: async () => {
          handleApproval(true);
        },
      };

      const rejectBtn = {
        key: 'reject',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Reject',
        }),

        //拒绝
        type: 'button',
        action: async () => {
          handleApproval(false);
        },
      };

      const reTryBtn = {
        key: 'reTry',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.InitiateAgain',
        }),

        //再次发起
        type: 'button',
        action: handleReTry,
      };

      const downloadBtn = {
        key: 'download',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Download',
        }),

        //下载
        action: download,
        type: 'button',
      };

      const openLocalFolder = {
        key: 'openLocalFolder',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.OpenFolder',
        }),

        //打开文件夹
        action: async () => {
          const info = await getTaskResult(task.id);
          if (info?.exportZipFilePath) {
            ipcInvoke('showItemInFolder', info?.exportZipFilePath);
          }
        },
        type: 'button',
      };

      const downloadViewResultBtn = {
        key: 'downloadViewResult',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.DownloadQueryResults',
        }),

        //下载查询结果
        action: downloadViewResult,
        type: 'button',
      };

      const viewResultBtn = {
        key: 'viewResult',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.QueryResults',
        }),

        //查询结果
        isLoading: viewLoading,
        action: viewResult,
        type: 'button',
      };

      if (isDetailModal) {
        switch (status) {
          case TaskStatus.REJECTED:
          case TaskStatus.APPROVAL_EXPIRED:
          case TaskStatus.WAIT_FOR_EXECUTION_EXPIRED:
          case TaskStatus.EXECUTION_EXPIRED:
          case TaskStatus.CREATED:
          case TaskStatus.EXECUTION_FAILED:
          case TaskStatus.ROLLBACK_FAILED:
          case TaskStatus.ROLLBACK_SUCCEEDED:
          case TaskStatus.CANCELLED:
          case TaskStatus.COMPLETED: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [reTryBtn];
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTING: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [reTryBtn, stopBtn];
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          case TaskStatus.EXECUTION_SUCCEEDED: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [reTryBtn];
              if (task.type === TaskType.EXPORT && settingStore.enableDataExport) {
                if (isClient()) {
                  tools.push(openLocalFolder);
                } else {
                  tools.push(downloadBtn);
                }
              } else if (task.type === TaskType.DATAMOCK && settingStore.enableDataExport) {
                tools.push(downloadBtn);
              } else if (task.type === TaskType.ASYNC && task?.rollbackable) {
                tools.push(rollbackBtn);
              }
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          case TaskStatus.WAIT_FOR_CONFIRM:
          case TaskStatus.APPROVING: {
            if (isOwner && isApprovable) {
              tools = [reTryBtn, stopBtn, rejectBtn, approvalBtn];
            } else {
              if (isOwner) {
                tools = [reTryBtn, stopBtn];
              }
              if (isApprovable) {
                tools = [rejectBtn, approvalBtn];
              }
            }
            break;
          }
          case TaskStatus.WAIT_FOR_EXECUTION: {
            if (isOwner || (isOwner && isApprovable)) {
              const _executeBtn = { ...executeBtn };
              if (task?.executionStrategy === TaskExecStrategy.TIMER) {
                _executeBtn.disabled = true;
                const executionTime = getLocalFormatDateTime(task?.executionTime);

                _executeBtn.tooltip = formatMessage(
                  {
                    id: 'odc.TaskManagePage.component.TaskTools.ScheduledExecutionTimeExecutiontime',
                  },

                  { executionTime: executionTime },
                );

                //`定时执行时间：${executionTime}`
              }
              tools =
                task?.executionStrategy === TaskExecStrategy.AUTO
                  ? [reTryBtn, stopBtn]
                  : [reTryBtn, stopBtn, _executeBtn];
            }
            if (isApprovable) {
              tools = [];
            }
            break;
          }
          default:
        }

        if (task?.type === TaskType.ASYNC && result?.containQuery) {
          if (settingStore.enableDataExport) {
            tools.unshift(downloadViewResultBtn);
          }
          tools.unshift(viewResultBtn);
        }
      } else {
        switch (status) {
          case TaskStatus.REJECTED:
          case TaskStatus.APPROVAL_EXPIRED:
          case TaskStatus.WAIT_FOR_EXECUTION_EXPIRED:
          case TaskStatus.EXECUTION_EXPIRED:
          case TaskStatus.EXECUTION_FAILED:
          case TaskStatus.ROLLBACK_FAILED:
          case TaskStatus.ROLLBACK_SUCCEEDED:
          case TaskStatus.CANCELLED:
          case TaskStatus.CREATED:
          case TaskStatus.ROLLBACKING: {
            tools = [viewBtn];
            break;
          }
          case TaskStatus.EXECUTING: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [viewBtn, stopBtn];
            } else {
              tools = [viewBtn];
            }
            break;
          }
          case TaskStatus.EXECUTION_SUCCEEDED: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [viewBtn];
              if (task.type === TaskType.EXPORT && settingStore.enableDataExport) {
                if (isClient()) {
                  tools.push(openLocalFolder);
                } else {
                  tools.push(downloadBtn);
                }
              } else if (task.type === TaskType.DATAMOCK && settingStore.enableDataExport) {
                tools.push(downloadBtn);
              } else if (task.type === TaskType.ASYNC && task?.rollbackable) {
                tools.push(rollbackBtn);
              }
            } else {
              tools = [viewBtn];
            }
            break;
          }
          case TaskStatus.WAIT_FOR_CONFIRM:
          case TaskStatus.APPROVING: {
            if (isOwner && isApprovable) {
              tools = [viewBtn, stopBtn, approvalBtn, rejectBtn];
            } else {
              if (isOwner) {
                tools = [viewBtn, stopBtn];
              } else if (isApprovable) {
                tools = [viewBtn, approvalBtn, rejectBtn];
              } else {
                tools = [viewBtn];
              }
            }
            break;
          }
          case TaskStatus.WAIT_FOR_EXECUTION: {
            if (isOwner || (isOwner && isApprovable)) {
              const _executeBtn = { ...executeBtn };
              if (task?.executionStrategy === TaskExecStrategy.TIMER) {
                _executeBtn.disabled = true;
                const executionTime = getLocalFormatDateTime(task?.executionTime);

                _executeBtn.tooltip = formatMessage(
                  {
                    id: 'odc.TaskManagePage.component.TaskTools.ScheduledExecutionTimeExecutiontime',
                  },

                  { executionTime: executionTime },
                );

                //`定时执行时间：${executionTime}`
              }
              tools =
                task?.executionStrategy === TaskExecStrategy.AUTO
                  ? [viewBtn, stopBtn]
                  : [viewBtn, _executeBtn, stopBtn];
            } else {
              tools = [viewBtn];
            }
            break;
          }
          case TaskStatus.COMPLETED: {
            if (isOwner || (isOwner && isApprovable)) {
              tools = [viewBtn];
            } else {
              tools = [viewBtn];
            }
            break;
          }
          default:
        }
      }
      if (task?.executionStrategy === TaskExecStrategy.TIMER) {
        // 定时任务无再次发起
        tools = tools?.filter((item) => item.key !== 'reTry');
      }
      return tools;
    };

    const getCycleTaskTools = (_task) => {
      let tools = [];

      if (!_task) {
        return [];
      }
      const { status } = _task;

      const viewBtn = {
        key: 'view',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.View',
        }), //查看
        action: openTaskDetail,
        type: 'button',
        isOpenBtn: true,
      };

      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Termination',
        }), //终止
        action: stopCycleTask,
        type: 'button',
      };

      const editBtn = {
        key: 'edit',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Edit',
        }), //编辑
        action: editCycleTask,
        type: 'button',
      };

      const disableBtn = {
        key: 'disable',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Disable',
        }), //禁用
        action: disableCycleTask,
        type: 'button',
      };

      const enableBtn = {
        key: 'enable',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Enable',
        }), //启用
        action: enableCycleTask,
        type: 'button',
      };

      const approvalBtn = {
        key: 'approval',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Pass',
        }), //通过
        type: 'button',
        isPrimary: isDetailModal,
        action: async () => {
          handleApproval(true);
        },
      };

      const rejectBtn = {
        key: 'reject',
        text: formatMessage({
          id: 'odc.TaskManagePage.component.TaskTools.Reject',
        }), //拒绝
        type: 'button',
        action: async () => {
          handleApproval(false);
        },
      };

      switch (status) {
        case TaskStatus.APPROVING: {
          if (isOwner && isApprovable) {
            tools = [viewBtn, stopBtn, approvalBtn, rejectBtn];
          } else {
            if (isOwner) {
              tools = [viewBtn, stopBtn];
            } else if (isApprovable) {
              tools = [viewBtn, approvalBtn, rejectBtn];
            } else {
              tools = [viewBtn];
            }
          }
          break;
        }
        case TaskStatus.REJECTED: {
          tools = [viewBtn];
          break;
        }
        case TaskStatus.ENABLED: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn, editBtn, disableBtn];
          } else {
            tools = [viewBtn];
          }
          break;
        }
        case TaskStatus.APPROVAL_EXPIRED:
        case TaskStatus.TERMINATION: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn];
          } else {
            tools = [viewBtn];
          }
          break;
        }
        case TaskStatus.PAUSE: {
          if (isOwner || (isOwner && isApprovable)) {
            tools = [viewBtn, editBtn, enableBtn];
          } else {
            tools = [viewBtn];
          }
          break;
        }
        default:
      }

      if (isDetailModal) {
        tools = tools.filter((item) => item.key !== 'view');
      }
      if (!taskStore.enabledCreate) {
        tools = tools.filter((item) => item.key !== 'edit');
      }
      return tools;
    };

    const getTools = (task) => {
      return isCycleTask(task?.type) ? getCycleTaskTools(task) : getTaskTools(task);
    };

    const btnTools = !isDetailModal
      ? getTools(task).filter((item) => item?.type === 'button')
      : getTools(task);

    const renderTool = (tool) => {
      const ActionButton = isDetailModal ? Action.Button : Action.Link;
      const disabled = activeBtnKey === tool?.key || tool?.disabled;
      if (tool.confirmText) {
        return (
          <Popconfirm title={tool.confirmText} onConfirm={tool.action}>
            <ActionButton disabled={disabled}>{tool.text}</ActionButton>
          </Popconfirm>
        );
      }

      if (tool.download) {
        return (
          <ActionButton disabled={disabled} onClick={tool.download}>
            {tool.text}
          </ActionButton>
        );
      }

      return (
        <ActionButton
          type={tool.isPrimary ? 'primary' : 'default'}
          disabled={disabled}
          onClick={tool.action}
          tooltip={isDetailModal ? tool?.tooltip : null}
        >
          <Tooltip placement="topRight" title={tool?.tooltip}>
            {tool.text}
          </Tooltip>
        </ActionButton>
      );
    };

    return (
      <>
        <Action.Group size={!isDetailModal ? 4 : 6}>
          {btnTools?.map((tool) => {
            return renderTool(tool);
          })}
        </Action.Group>
        <RollBackModal open={openRollback} onOk={confirmRollback} onCancel={handleCloseRollback} />
      </>
    );
  }),
);

export default ActionBar;
