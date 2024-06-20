import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RESOURCE_EVERYTHING, viewRuns } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { fetchRuns } from "@/modules/wes/actions";

export const useRuns = () => {
  const dispatch = useDispatch();

  const wes = useService("wes"); // TODO: associate this with the network action somehow
  const { hasPermission } = useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, viewRuns);

  useEffect(() => {
    // If hasPermission changes to true, this will automatically dispatch the drop box fetch method.
    if (hasPermission) {
      dispatch(fetchRuns()).catch((err) => console.error(err));
    }
  }, [dispatch, wes, hasPermission]);

  return useSelector((state) => state.runs);
};
