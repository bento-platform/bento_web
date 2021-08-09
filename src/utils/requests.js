const SERIALIZED_TYPES = ["object", "array"];

export const createFormData = obj => {
    const formData = new FormData();
    Object.entries(obj).forEach(([k, v]) =>
        formData.append(k, (SERIALIZED_TYPES.includes(typeof v)) ? JSON.stringify(v) : v));
    return formData;
};

export const createURLSearchParams = obj => {
    const usp = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => usp.set(k, typeof v === "object" ? JSON.stringify(v) : v));
    return usp;
};

export const jsonRequest = (body, method = "GET") => ({
    method,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body),
});
