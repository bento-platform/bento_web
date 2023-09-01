export const getDataServices = (state) =>
    state.services.items.filter(serviceInfo => serviceInfo.bento?.dataService ?? false);
