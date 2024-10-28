import { useEffect } from "react";

import { RESOURCE_EVERYTHING, viewRuns } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { fetchRuns } from "@/modules/wes/actions";
import { useAppDispatch, useAppSelector } from "@/store";

export const useRuns = () => {
  const dispatch = useAppDispatch();

  const wes = useService("wes"); // TODO: associate this with the network action somehow
  const { hasPermission } = useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, viewRuns);

  useEffect(() => {
    // If hasPermission changes to true, this will automatically dispatch the drop box fetch method.
    if (hasPermission) {
      dispatch(fetchRuns()).catch((err) => console.error(err));
    }
  }, [dispatch, wes, hasPermission]);

  return useAppSelector((state) => state.runs);
};
