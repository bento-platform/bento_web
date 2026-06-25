import type { DatasetModelBase } from "@/types/dataset";

export type DRFErrors = Record<string, string[]>;

export type TranslationApiResult =
  | { ok: true; data: DatasetModelBase }
  | { ok: false; status: number; drfErrors?: DRFErrors };

const translationsUrl = (baseUrl: string, datasetId: string, lang?: string) =>
  `${baseUrl}/api/datasets/${datasetId}/translations${lang ? `/${lang}` : ""}`;

export async function fetchTranslation(
  baseUrl: string,
  datasetId: string,
  lang: string,
  authHeader: Record<string, string>,
): Promise<{ exists: true; data: DatasetModelBase } | { exists: false } | { exists: null; error: string }> {
  try {
    const res = await fetch(translationsUrl(baseUrl, datasetId, lang), {
      headers: { Accept: "application/json", ...authHeader },
    });
    if (res.ok) return { exists: true, data: (await res.json()) as DatasetModelBase };
    if (res.status === 404) return { exists: false };
    return { exists: null, error: `HTTP ${res.status}` };
  } catch {
    return { exists: null, error: "Network error" };
  }
}

export async function deleteTranslation(
  baseUrl: string,
  datasetId: string,
  lang: string,
  authHeader: Record<string, string>,
): Promise<{ ok: true } | { ok: false; status: number }> {
  try {
    const res = await fetch(translationsUrl(baseUrl, datasetId, lang), {
      method: "DELETE",
      headers: { Accept: "application/json", ...authHeader },
    });
    if (res.ok) return { ok: true };
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function upsertTranslation(
  baseUrl: string,
  datasetId: string,
  lang: string,
  payload: DatasetModelBase,
  isEdit: boolean,
  authHeader: Record<string, string>,
): Promise<TranslationApiResult> {
  try {
    const res = await fetch(translationsUrl(baseUrl, datasetId, isEdit ? lang : undefined), {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true, data: (await res.json()) as DatasetModelBase };
    if (res.status === 400) {
      const drfErrors = (await res.json()) as DRFErrors;
      return { ok: false, status: 400, drfErrors };
    }
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
