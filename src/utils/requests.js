const SERIALIZED_TYPES = ["object", "array"];

export const createFormData = (obj) => {
  const formData = new FormData();
  Object.entries(obj).forEach(([k, v]) =>
    formData.append(k, SERIALIZED_TYPES.includes(typeof v) ? JSON.stringify(v) : v),
  );
  return formData;
};

export const jsonRequest = (body, method = "GET", extraHeaders = undefined) => ({
  method,
  headers: { "Content-Type": "application/json", ...(extraHeaders ?? {}) },
  body: JSON.stringify(body),
});
