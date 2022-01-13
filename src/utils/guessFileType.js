// file type guesses for igv files, for cases where this information is missing
export const guessFileType = (filename) => {
    if (filename.toLowerCase().endsWith(".vcf.gz")) {
        return ("vcf");
    }
    if (filename.toLowerCase().endsWith(".cram")) {
        return ("cram");
    }
    if (filename.toLowerCase().endsWith(".bw") || filename.toLowerCase().endsWith(".bigwig")) {
        return "bigwig";
    }

    // expand here accordingly
    return null;
};
