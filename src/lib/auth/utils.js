export const buildUrlEncodedData = obj =>
    Object.entries(obj).reduce((params, [k, v]) => params.set(k, v.toString()) || params, new URLSearchParams());
