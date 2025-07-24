import { useMemo } from "react";

import { TreeSelect, type TreeSelectProps } from "antd";

import { useDropBox } from "@/modules/dropBox/hooks";
import type { DropBoxEntry } from "@/modules/dropBox/types";
import { getTrue } from "@/utils/misc";

import { sortByName } from "./common";

type DropBoxEntryValidFunction = (x: DropBoxEntry) => boolean;

export const generateFileTree = (
  directory: DropBoxEntry[],
  valid: DropBoxEntryValidFunction,
  folderMode: boolean,
): TreeSelectProps["treeData"] =>
  [...directory]
    .sort(sortByName)
    .filter((entry) => !folderMode || entry.contents !== undefined) // Don't show files in folder mode
    .map((entry: DropBoxEntry) => {
      const { name, contents, relativePath } = entry;
      const isValid = valid(entry);
      const isFolder = contents !== undefined;

      let renderAsLeaf = !isFolder;
      if (folderMode && isFolder) {
        // See if we have at least one nested child... otherwise, render this as a leaf in folder mode.
        renderAsLeaf = contents.findIndex((c) => c.contents !== undefined) === -1;
      }

      return {
        value: relativePath,
        title: name,
        disabled: !isValid,
        isLeaf: renderAsLeaf,
        selectable: folderMode ? isFolder : !isFolder,
        ...(isFolder && {
          children: generateFileTree(contents, valid, folderMode),
        }),
      };
    });

export type DropBoxTreeSelectProps = Omit<TreeSelectProps, "showSearch" | "treeDefaultExpandAll" | "treeData"> & {
  folderMode?: boolean;
  nodeEnabled?: DropBoxEntryValidFunction;
};

const DropBoxTreeSelect = ({ folderMode = false, nodeEnabled, ...props }: DropBoxTreeSelectProps) => {
  const { tree } = useDropBox();

  const fileTree = useMemo(
    () => generateFileTree(tree, nodeEnabled ?? getTrue, folderMode),
    [tree, nodeEnabled, folderMode],
  );

  return (
    <TreeSelect
      showSearch={true}
      treeDefaultExpandAll={true}
      treeData={[
        {
          value: "/",
          title: "Drop Box",
          selectable: folderMode,
          children: fileTree,
        },
      ]}
      {...props}
    />
  );
};

export default DropBoxTreeSelect;
