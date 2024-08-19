import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESOURCE_EVERYTHING, viewNotifications } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { fetchNotifications } from "./actions";

export const useNotifications = () => {
  const dispatch = useDispatch();

  const service = useService("notification");

  // TODO: notifications should eventually be user-specific and no longer need this permission/UI code.
  const { hasPermission } = useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, viewNotifications);

  useEffect(() => {
    if (hasPermission) {
      dispatch(fetchNotifications()).catch((err) => console.error(err));
    }
  }, [dispatch, service, hasPermission]);

  return useSelector((state) => state.notifications);
};
