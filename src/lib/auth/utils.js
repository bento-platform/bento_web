export const buildUrlEncodedData = obj =>
    Object.entries(obj).reduce((params, [k, v]) => params.set(k, v.toString()) || params, new URLSearchParams());

export const getIsAuthenticated = idTokenContents =>
    !!idTokenContents && (new Date()).getTime() < idTokenContents.exp;
