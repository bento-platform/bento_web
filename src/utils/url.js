import {BENTO_URL} from "../config";

export const urlPath = url => {
    try {
        return (new URL(url)).pathname;
    } catch (e) {
        // Wrap possible thrown error with something to log the actual URL value.
        console.error(`Error with URL: ${url}`);
        throw e;
    }
};

// Allow embedding of BENTO_URL at runtime or build time
export const BASE_PATH = BENTO_URL ? urlPath(BENTO_URL) : "/";
export const withBasePath = path => `${BASE_PATH}${(path.length > 0 && path[0] === "/" ? path.slice(1) : path)}`;
