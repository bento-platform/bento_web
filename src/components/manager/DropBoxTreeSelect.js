import { forwardRef, useMemo } from "react";
import PropTypes from "prop-types";
import { TreeSelect } from "antd";

import { getTrue } from "@/utils/misc";
import { useDropBox } from "@/modules/manager/hooks";

const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid, folderMode, basePrefix) =>
  [...directory]
    .sort(sortByName)
    .filter((entry) => !folderMode || entry.contents !== undefined) // Don't show files in folder mode
    .map((entry) => {
      const { name, contents, relativePath } = entry;
      const isValid = valid(entry);
      const isFolder = contents !== undefined;

      let renderAsLeaf = !isFolder;
      if (folderMode && isFolder) {
        // See if we have at least one nested child... otherwise, render this as a leaf in folder mode.
        renderAsLeaf = contents.findIndex((c) => c.contents !== undefined) === -1;
      }

      const k = (basePrefix ?? "") + relativePath;

      return {
        value: k,
        title: name,
        disabled: !isValid,
        isLeaf: renderAsLeaf,
        selectable: folderMode ? isFolder : !isFolder,
        ...(isFolder && {
          children: generateFileTree(contents, valid, folderMode, basePrefix),
        }),
      };
    });

const DropBoxTreeSelect = forwardRef(({ folderMode, nodeEnabled, basePrefix, ...props }, ref) => {
  const { tree } = useDropBox();

  const fileTree = useMemo(
    () => generateFileTree(tree, nodeEnabled ?? getTrue, folderMode, basePrefix),
    [tree, nodeEnabled, folderMode, basePrefix],
  );

  return (
    <TreeSelect
      ref={ref}
      showSearch={true}
      treeDefaultExpandAll={true}
      treeData={[
        {
          value: basePrefix ?? "/",
          title: "Drop Box",
          selectable: folderMode,
          children: fileTree,
        },
      ]}
      {...props}
    />
  );
});

DropBoxTreeSelect.propTypes = {
  folderMode: PropTypes.bool,
  nodeEnabled: PropTypes.func,
  basePrefix: PropTypes.string,
};

DropBoxTreeSelect.defaultProps = {
  folderMode: false,
};

export default DropBoxTreeSelect;
