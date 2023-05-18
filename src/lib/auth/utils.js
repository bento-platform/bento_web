// noinspection JSCheckFunctionSignatures
export const buildUrlEncodedData = obj =>
    Object.entries(obj).reduce((params, [k, v]) => {
        params.set(k, v.toString());
        return params;
    }, new URLSearchParams());

export const getIsAuthenticated = idTokenContents =>
    !!idTokenContents && Math.round((new Date()).getTime() / 1000) < idTokenContents.exp;
