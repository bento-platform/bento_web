import { notification } from "antd";
import "antd/es/notification/style/css";

import { addNotification, markNotificationAsRead } from "./actions";
import { fetchOverviewSummary } from "../metadata/actions";
import { navigateToWESRun } from "../../utils/notifications";

const EVENT_NOTIFICATION = "notification";

const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";
const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";

export default {
    [/^bento\.service\.notification$/.source]: (message, history) => async dispatch => {
        if (message.type !== EVENT_NOTIFICATION) return;

        const messageData = message.data || {};

        await dispatch(addNotification(messageData));

        const notificationData = {
            // Assume message data has at least ID, title, description, and read, although it should have everything
            ...messageData,
            notification_type: messageData.notification_type || "generic",
            action_target: messageData.action_target || null,
        };

        const notificationBasics = {
            message: notificationData.title,
            description: notificationData.description,
        };

        const wesClickAction = () => {
            dispatch(markNotificationAsRead(notificationData.id));
            dispatch(navigateToWESRun(notificationData.action_target, history));
        };

        switch (message.data.notification_type) {
            case NOTIFICATION_WES_RUN_FAILED:
                notification.error({
                    ...notificationBasics,
                    onClick: wesClickAction,
                });
                break;

            case NOTIFICATION_WES_RUN_COMPLETED:
                // Notify the user that the workflow succeeded
                notification.success({
                    ...notificationBasics,
                    onClick: wesClickAction,
                });
                // Reload overview data when a workflow completes
                dispatch(fetchOverviewSummary());
                break;

            default:
                notification.open(notificationBasics);
        }
    },
};
