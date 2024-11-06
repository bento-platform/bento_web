import type { AppDispatch } from "@/store";

type FlowActionTypes = {
  BEGIN: string;
  END: string;
  TERMINATE: string;
};

export const createFlowActionTypes = (name: string): FlowActionTypes => ({
  BEGIN: `${name}.BEGIN`,
  END: `${name}.END`,
  TERMINATE: `${name}.TERMINATE`,
});

export const beginFlow =
  (types: FlowActionTypes, params: Record<string, unknown> | undefined = undefined) =>
  (dispatch: AppDispatch) =>
    dispatch({ type: types.BEGIN, ...(params ?? {}) });
export const endFlow =
  (types: FlowActionTypes, params: Record<string, unknown> | undefined = undefined) =>
  (dispatch: AppDispatch) =>
    dispatch({ type: types.END, ...(params ?? {}) });
export const terminateFlow =
  (types: FlowActionTypes, params: Record<string, unknown> | undefined = undefined) =>
  (dispatch: AppDispatch) =>
    dispatch({ type: types.TERMINATE, ...(params ?? {}) });
