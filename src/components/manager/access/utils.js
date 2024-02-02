export const stringifyJSONRenderIfMultiKey = (x) =>
    JSON.stringify(
        x,
        null,
        (typeof x === "object" && Object.keys(x).length > 1) ? 2 : null,
    );
