import dayjs from "dayjs";
import { DatasetModelBase } from "@/types/dataset";
import type { DatasetModelBase as DatasetModelBaseType } from "@/types/dataset";

/** Convert antd form values → schema-compatible shape, then validate with Zod */
export function validateWithZod(
  values: unknown,
):
  | { success: true; data: DatasetModelBaseType }
  | { success: false; errors: Array<{ path: string; message: string }> } {
  const result = DatasetModelBase.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/** Strip undefined / null leaves so Zod doesn't complain about missing optionals */
export function cleanFormValues(obj: unknown): unknown {
  if (obj === null || obj === undefined || obj === "") return undefined;
  if (Array.isArray(obj)) {
    const cleaned = obj.map(cleanFormValues).filter((v) => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    let hasKeys = false;
    for (const [k, v] of Object.entries(obj)) {
      const cv = cleanFormValues(v);
      if (cv !== undefined) {
        cleaned[k] = cv;
        hasKeys = true;
      }
    }
    return hasKeys ? cleaned : undefined;
  }
  return obj;
}

/** Convert a dayjs date-picker value to YYYY-MM-DD string */
export function dayjsToDateString(d: unknown): string | undefined {
  if (!d) return undefined;
  return dayjs(d as Parameters<typeof dayjs>[0]).format("YYYY-MM-DD");
}

/** Helper to access a nested value from a plain object by path array */
export function getNestedValue(obj: unknown, path: (string | number)[]): unknown {
  let current = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

/** Convert date string fields to dayjs objects so antd DatePicker receives the correct type */
export function prepareInitialValues(
  values: Partial<DatasetModelBaseType> | undefined,
): Record<string, unknown> | undefined {
  if (!values) return undefined;
  const result: Record<string, unknown> = { ...values };
  if (result.release_date) result.release_date = dayjs(result.release_date as string);
  if (result.last_modified) result.last_modified = dayjs(result.last_modified as string);
  if (Array.isArray(result.publications)) {
    result.publications = result.publications.map((pub: Record<string, unknown>) => ({
      ...pub,
      publication_date: pub.publication_date ? dayjs(pub.publication_date as string) : undefined,
    }));
  }
  if (Array.isArray(result.keywords)) {
    result.keywords = result.keywords.map((kw: unknown) => (typeof kw === "string" ? { value: kw } : kw));
  }
  if (Array.isArray(result.taxonomy)) {
    result.taxonomy = result.taxonomy.map((t: unknown) => (typeof t === "string" ? { value: t } : t));
  }
  return result;
}
