import { useDispatch, useSelector } from "react-redux";
import { RESOURCE_EVERYTHING, viewNotifications } from "bento-auth-js";
import { useHasResourcePermissionWrapper } from "@/hooks";
import { useEffect } from "react";
import { fetchNotificationsIfPossible } from "@/modules/notifications/actions";

export const useNotifications = () => {
    const dispatch = useDispatch();

    // TODO: notifications should eventually be user-specific and no longer need this permission/UI code.
    const { hasPermission } = useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, viewNotifications);

    useEffect(() => {
        dispatch(fetchNotificationsIfPossible()).catch((err) => console.error(err));
    }, [dispatch, hasPermission]);

    return useSelector((state) => state.notifications);
};
