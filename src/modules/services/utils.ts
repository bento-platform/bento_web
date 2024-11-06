import type { RootState } from "@/store";

export const getDataServices = (state: RootState) =>
  state.services.items.filter((serviceInfo) => serviceInfo.bento?.dataService ?? false);
