import type { DropBoxEntry } from "@/modules/dropBox/types";

export type GenomicsFileType = "gvcf" | "vcf" | "maf" | "sam" | "bam" | "cram" | "bigwig";

// file type guesses for igv files, for cases where this information is missing
export const guessFileType = (filename: string): GenomicsFileType | undefined => {
  const filenameLower = filename.toLowerCase();

  // variant:
  if (filenameLower.endsWith(".g.vcf") || filenameLower.endsWith(".g.vcf.gz")) return "gvcf";
  if (filenameLower.endsWith(".vcf") || filenameLower.endsWith(".vcf.gz")) return "vcf";
  // mutation:
  if (filenameLower.endsWith(".maf")) return "maf";
  // alignment:
  if (filenameLower.endsWith(".sam")) return "sam";
  if (filenameLower.endsWith(".bam")) return "bam";
  if (filenameLower.endsWith(".cram")) return "cram";
  // wig:
  if (filenameLower.endsWith(".bw") || filenameLower.endsWith(".bigwig")) return "bigwig";

  // expand here accordingly
  return undefined;
};

const FILE_TEST_REGEX_CACHE: Record<string, RegExp> = {};

const _getFileRegExp = (pattern: string): RegExp => {
  if (pattern in FILE_TEST_REGEX_CACHE) {
    return FILE_TEST_REGEX_CACHE[pattern];
  }

  const r = new RegExp(pattern, "i");
  FILE_TEST_REGEX_CACHE[pattern] = r;
  return r;
};

export const testFileAgainstPattern = (fileName: string, pattern: string): boolean => {
  if (!pattern) {
    // No pattern => everything matches
    return true;
  }
  const r = _getFileRegExp(pattern);
  return r.test(fileName);
};

export const dropBoxTreeNodeEnabledJson = (entry: DropBoxEntry) => {
  return entry?.contents !== undefined || testFileAgainstPattern(entry.name, "^.*.json$");
};
