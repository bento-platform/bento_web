import {recursiveOrderedObject} from "../../utils/misc";

export const RESOURCE_EVERYTHING = {"everything": true};

// TODO: use records instead of JSON string (when formalized):
export const makeResourceKey = x => JSON.stringify(recursiveOrderedObject(x));
