import {hideNotificationDrawer} from "../modules/notifications/actions";

export const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";
export const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";

export const navigateToWESRun = (target, history) => async dispatch => {
    await dispatch(hideNotificationDrawer());
    history.push(`/admin/data/manager/runs/${target}/request`);
};
