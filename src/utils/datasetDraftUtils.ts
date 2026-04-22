import dayjs from "dayjs";
import { readFromLocalStorage, writeToLocalStorage } from "./localStorageUtils";

export interface DraftRecord {
  savedAt: string;
  values: unknown;
}

export function serializeFormValues(values: unknown): unknown {
  if (dayjs.isDayjs(values)) return { __type: "dayjs", value: values.format("YYYY-MM-DD") };
  if (Array.isArray(values)) return values.map(serializeFormValues);
  if (typeof values === "object" && values !== null) {
    return Object.fromEntries(
      Object.entries(values as Record<string, unknown>).map(([k, v]) => [k, serializeFormValues(v)]),
    );
  }
  return values;
}

export function deserializeFormValues(values: unknown): unknown {
  if (
    typeof values === "object" &&
    values !== null &&
    !Array.isArray(values) &&
    (values as Record<string, unknown>).__type === "dayjs" &&
    typeof (values as Record<string, unknown>).value === "string"
  ) {
    return dayjs((values as Record<string, unknown>).value as string);
  }
  if (Array.isArray(values)) return values.map(deserializeFormValues);
  if (typeof values === "object" && values !== null) {
    return Object.fromEntries(
      Object.entries(values as Record<string, unknown>).map(([k, v]) => [k, deserializeFormValues(v)]),
    );
  }
  return values;
}

export function saveDraft(key: string, formValues: unknown): void {
  writeToLocalStorage(key, { savedAt: new Date().toISOString(), values: serializeFormValues(formValues) });
}

export function loadDraft(key: string): DraftRecord | null {
  return readFromLocalStorage<DraftRecord>(key);
}

export function clearDraft(key: string): void {
  localStorage.removeItem(key);
}
