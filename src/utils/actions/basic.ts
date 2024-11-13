import type { Action } from "redux";

export const basicAction = (t: string) => (): Action => ({ type: t });
