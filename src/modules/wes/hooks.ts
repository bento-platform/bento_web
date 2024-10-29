import { useEffect } from "react";

import { RESOURCE_EVERYTHING, viewRuns } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

import { fetchRuns } from "./actions";
import type { WorkflowRunsState } from "./types";

export const useRuns = (): WorkflowRunsState => {
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
