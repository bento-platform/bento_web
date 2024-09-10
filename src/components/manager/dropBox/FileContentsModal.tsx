import { useMemo } from "react";

import FileModal from "@/components/display/FileModal";
import { useDropBox } from "@/modules/dropBox/hooks";
import type { DropBoxEntry } from "@/modules/dropBox/types";

const generateURIsByRelPath = (entry: DropBoxEntry, acc: Record<string, string>) => {
  if (Array.isArray(entry)) {
    entry.forEach((e) => generateURIsByRelPath(e, acc));
  } else if (entry.uri) {
    acc[entry.relativePath] = entry.uri;
  } else if (entry.contents) {
    entry.contents.forEach((e) => generateURIsByRelPath(e, acc));
  }
  return acc;
};

type FileContentsModalType = {
  selectedFilePath?: string;
  open: boolean;
  onCancel: () => void;
};

const FileContentsModal = ({ selectedFilePath, open, onCancel }: FileContentsModalType) => {
  const { tree, isFetching: treeLoading } = useDropBox();

  const urisByFilePath = useMemo(() => generateURIsByRelPath(tree, {}), [tree]);
  const uri = useMemo(
    () => (selectedFilePath ? urisByFilePath[selectedFilePath] : undefined),
    [urisByFilePath, selectedFilePath],
  );

  // destroyOnClose in order to stop audio/video from playing & avoid memory leaks at the cost of re-fetching
  return (
    <FileModal
      open={open}
      onCancel={onCancel}
      title={selectedFilePath ? `${selectedFilePath.split("/").at(-1)} - contents` : ""}
      url={uri}
      fileName={selectedFilePath}
      loading={treeLoading}
    />
  );
};

export default FileContentsModal;
