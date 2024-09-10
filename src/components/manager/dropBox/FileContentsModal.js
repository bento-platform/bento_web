import { useMemo } from "react";
import PropTypes from "prop-types";

import { useDropBox } from "@/modules/dropBox/hooks";
import FileModal from "@/components/display/FileModal";

const generateURIsByRelPath = (entry, acc) => {
  if (Array.isArray(entry)) {
    entry.forEach((e) => generateURIsByRelPath(e, acc));
  } else if (entry.uri) {
    acc[entry.relativePath] = entry.uri;
  } else if (entry.contents) {
    entry.contents.forEach((e) => generateURIsByRelPath(e, acc));
  }
  return acc;
};

const FileContentsModal = ({ selectedFilePath, open, onCancel }) => {
  const { tree, isFetching: treeLoading } = useDropBox();

  const urisByFilePath = useMemo(() => generateURIsByRelPath(tree, {}), [tree]);
  const uri = useMemo(() => urisByFilePath[selectedFilePath], [urisByFilePath, selectedFilePath]);

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

FileContentsModal.propTypes = {
  selectedFilePath: PropTypes.string,
  open: PropTypes.bool,
  onCancel: PropTypes.func,
};

export default FileContentsModal;
