export type DropBoxEntry = {
  // general
  name: string;
  relativePath: string;
  filePath: string;
  // file
  uri?: string;
  lastModified?: number;
  lastMetadataChange?: number;
  size?: number;
  // directory
  contents?: DropBoxEntry[];
};
