export const stringifyJSONRenderIfMultiKey = (x: object): string =>
  JSON.stringify(x, undefined, typeof x === "object" && Object.keys(x).length > 1 ? 2 : undefined);

export const rowKey = (row: { id: number }): string => row.id.toString();
