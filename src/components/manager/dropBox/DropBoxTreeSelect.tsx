import { useMemo } from "react";

import { TreeSelect, type TreeSelectProps } from "antd";

import { useDropBox } from "@/modules/dropBox/hooks";
import type { DropBoxEntry } from "@/modules/dropBox/types";
import { getTrue } from "@/utils/misc";

type DropBoxEntryValidFunction = (x: DropBoxEntry) => boolean;

const sortByName = (a: DropBoxEntry, b: DropBoxEntry) => a.name.localeCompare(b.name);
export const generateFileTree = (
  directory: DropBoxEntry[],
  valid: DropBoxEntryValidFunction,
  folderMode: boolean,
  basePrefix: string | undefined,
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

export type DropBoxTreeSelectProps = Omit<TreeSelectProps, "showSearch" | "treeDefaultExpandAll" | "treeData"> & {
  folderMode?: boolean;
  nodeEnabled?: DropBoxEntryValidFunction; // TODO: more precise typing when common functions are typed
  basePrefix?: string;
};

const DropBoxTreeSelect = ({ folderMode = false, nodeEnabled, basePrefix, ...props }: DropBoxTreeSelectProps) => {
  const { tree } = useDropBox();

  const fileTree = useMemo(
    () => generateFileTree(tree, nodeEnabled ?? getTrue, folderMode, basePrefix),
    [tree, nodeEnabled, folderMode, basePrefix],
  );

  return (
    <TreeSelect
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
};

export default DropBoxTreeSelect;
