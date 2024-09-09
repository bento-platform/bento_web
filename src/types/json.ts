// See https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540

export type JSONType = string | number | boolean | null | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONType;
}

interface JSONArray extends Array<JSONType> {}
