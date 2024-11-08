import fetch from "cross-fetch";

type NetworkActionTypes = {
  REQUEST: string;
  RECEIVE: string;
  ERROR: string;
  FINISH: string;
};

export const createNetworkActionTypes = (name: string): NetworkActionTypes => ({
  REQUEST: `${name}.REQUEST`,
  RECEIVE: `${name}.RECEIVE`,
  ERROR: `${name}.ERROR`,
  FINISH: `${name}.FINISH`,
});

type BaseBentoResponse = { errors?: string[]; message?: string };

export const _unpaginatedNetworkFetch = async <T extends object>(
  url: string,
  _baseUrl: unknown,
  req: RequestInit,
  parse: ((x: Response) => T & BaseBentoResponse) | ((x: Response) => Promise<T & BaseBentoResponse>),
): Promise<T | null> => {
  const response = await fetch(url, req);
  if (!response.ok) {
    const errorData = await parse(response);
    const errorsArray = errorData.errors ?? [];
    throw new Error(errorData.message || `${response.status} ${response.statusText}`, { cause: errorsArray });
  }
  return response.status === 204 ? null : ((await parse(response)) as T);
};
