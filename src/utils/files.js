// file type guesses for igv files, for cases where this information is missing
export const guessFileType = (filename) => {
    const filenameLower = filename.toLowerCase();

    if (filenameLower.endsWith(".vcf.gz")) {
        return "vcf";
    }
    if (filenameLower.endsWith(".bam")) {
        return "bam";
    }
    if (filenameLower.endsWith(".cram")) {
        return "cram";
    }
    if (filenameLower.endsWith(".bw") || filenameLower.endsWith(".bigwig")) {
        return "bigwig";
    }

    // expand here accordingly
    return null;
};

/** @type {Object.<string, RegExp>} */
const FILE_TEST_REGEX_CACHE = {};

const _getFileRegExp = (pattern) => {
    if (pattern in FILE_TEST_REGEX_CACHE) {
        return FILE_TEST_REGEX_CACHE[pattern];
    }

    const r = new RegExp(pattern, "i");
    FILE_TEST_REGEX_CACHE[pattern] = r;
    return r;
};

export const testFileAgainstPattern = (fileName, pattern) => {
    if (!pattern) {
        // No pattern => everything matches
        return true;
    }
    const r = _getFileRegExp(pattern);
    return r.test(fileName);
};
