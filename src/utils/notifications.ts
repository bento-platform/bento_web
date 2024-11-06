import type { NavigateFunction } from "react-router-dom";
import { hideNotificationDrawer } from "@/modules/notifications/actions";
import { AppDispatch } from "@/store";

export const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";
export const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";

export const navigateToWESRun = (target: string, navigate: NavigateFunction) => (dispatch: AppDispatch) => {
  dispatch(hideNotificationDrawer());
  navigate(`/data/manager/runs/${target}/request`);
};
