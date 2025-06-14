import { type Options as AjvOptions } from "ajv";

export const SITE_NAME = "Bento";

export const FORM_MODE_ADD = "add";
export const FORM_MODE_EDIT = "edit";

export const EM_DASH = "—";

export const DEFAULT_OTHER_THRESHOLD_PERCENTAGE = 4;

export const IGV_JS_GENOMES_JSON_URL = "https://s3.amazonaws.com/igv.org.genomes/genomes.json";

export const COLOR_ANTD_RED_6 = "#f5222d";

export const AJV_OPTIONS: AjvOptions = { allErrors: true, strict: false };
