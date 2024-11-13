import type { JSONType } from "@/types/json";

const SERIALIZED_TYPES = ["object", "array"];

export const createFormData = (obj: Record<string | number, JSONType>) => {
  const formData = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    // If values are "null-like", leave them out. It will be up to the receiver to (correctly) determine that a missing
    // key means undefined/null.
    if (v === undefined || v === null) return;
    formData.append(k, SERIALIZED_TYPES.includes(typeof v) ? JSON.stringify(v) : v.toString());
  });
  return formData;
};

export const jsonRequest = (
  body: JSONType,
  method = "GET",
  extraHeaders: Record<string, string> | undefined = undefined,
): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json", ...(extraHeaders ?? {}) },
  body: JSON.stringify(body),
});
