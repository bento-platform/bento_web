import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Flex, Input, Space, Switch, Tag, TreeSelect, type TreeSelectProps } from "antd";
import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";

import ErrorText from "@/components/common/ErrorText";

import { useDropBox } from "@/modules/dropBox/hooks";
import type { DropBoxEntry } from "@/modules/dropBox/types";
import { getTrue } from "@/utils/misc";

import { sortByName } from "./common";

type DropBoxEntryValidFunction = (x: DropBoxEntry) => boolean;

type DropBoxTreeSelectData = Exclude<TreeSelectProps["treeData"], undefined>;

const _isDirectSubItem = (currentPath: string, entryPath: string) =>
  entryPath.startsWith(currentPath) &&
  !entryPath.slice(currentPath.length + 1).includes("/") &&
  entryPath !== currentPath;

const generateFileTree = (
  directory: DropBoxEntry[],
  newFolderEntries: DropBoxTreeSelectData,
  valid: DropBoxEntryValidFunction,
  folderMode: boolean,
  showFilesInFolderMode: boolean,
  currentPath: string,
  valueAcc: string[],
): DropBoxTreeSelectData => {
  const sortedDir = [...directory].sort(sortByName);

  sortedDir.forEach((entry) => {
    valueAcc.push(entry.relativePath);
  });

  const res: DropBoxTreeSelectData = sortedDir
    .filter((entry) => !folderMode || showFilesInFolderMode || entry.contents !== undefined)
    .map((entry: DropBoxEntry) => {
      const { name, contents, relativePath } = entry;
      const isValid = valid(entry);
      const directSubItems = newFolderEntries.filter((e) => _isDirectSubItem(relativePath, e.value as string));
      const isFolder = contents !== undefined || directSubItems.length > 0;

      let renderAsLeaf = !isFolder;
      if (folderMode && isFolder) {
        // See if we have at least one nested child... otherwise, render this as a leaf in folder mode.
        // A nested child could be either:
        //  - a real current drop box folder/S3 "folder"
        //  - a newly-"created" subfolder with this entry as a direct parent
        renderAsLeaf =
          (contents ?? []).findIndex(
            (c) =>
              c.contents !== undefined ||
              newFolderEntries.findIndex((e) => _isDirectSubItem(c.relativePath, e.value as string)) !== -1,
          ) === -1 && directSubItems.length === 0;
      }

      return {
        value: relativePath,
        title: name,
        disabled: !isValid || (folderMode && showFilesInFolderMode && !isFolder),
        isLeaf: renderAsLeaf,
        selectable: folderMode ? isFolder : !isFolder,
        ...(isFolder && {
          children: generateFileTree(
            contents ?? [],
            newFolderEntries,
            valid,
            folderMode,
            showFilesInFolderMode,
            relativePath,
            valueAcc,
          ),
        }),
      };
    });

  newFolderEntries.forEach((e) => {
    const entryPath = e.value! as string;
    console.log(currentPath, entryPath, _isDirectSubItem(currentPath, entryPath));
    if (_isDirectSubItem(currentPath, entryPath)) {
      res.push(e);
    }
  });

  return res;
};

export type DropBoxTreeSelectProps = Omit<TreeSelectProps, "showSearch" | "treeDefaultExpandAll" | "treeData"> & {
  folderMode?: boolean;
  allowFolderCreation?: boolean;
  nodeEnabled?: DropBoxEntryValidFunction;
  setValue?: (value: string) => void;
};

const DropBoxTreeSelect = ({
  folderMode = false,
  allowFolderCreation = false,
  nodeEnabled,
  value,
  setValue,
  onChange,
  ...props
}: DropBoxTreeSelectProps) => {
  const { tree } = useDropBox();

  const [localValue, setLocalValue] = useState<string | undefined>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const [showFilesInFolderMode, setShowFilesInFolderMode] = useState(false);
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [newSubfolderError, setNewSubfolderError] = useState("");

  const [newTreeFolderPaths, setNewTreeFolderPaths] = useState<Set<string>>(new Set());
  const [newTreeFolderEntries, setNewTreeFolderEntries] = useState<DropBoxTreeSelectData>([]);

  const [treeData, valueSet] = useMemo(() => {
    const valueAcc: string[] = [];
    const fileTree = generateFileTree(
      tree,
      newTreeFolderEntries,
      nodeEnabled ?? getTrue,
      folderMode,
      showFilesInFolderMode,
      "/",
      valueAcc,
    );
    return [
      [
        {
          value: "/",
          title: "Drop Box",
          selectable: folderMode,
          children: fileTree,
        },
      ],
      new Set(["/", ...valueAcc]),
    ];
  }, [tree, nodeEnabled, folderMode, showFilesInFolderMode, newTreeFolderEntries]);

  const localOnChange = useCallback<Exclude<TreeSelectProps<string>["onChange"], undefined>>(
    (value, labelList, extra) => {
      if (onChange) {
        onChange(value, labelList, extra);
      } else {
        setLocalValue(value);
      }
    },
    [onChange],
  );

  const onCreateSubfolderCancel = useCallback(() => {
    setIsCreatingSubfolder(false);
    setNewSubfolderName("");
  }, []);

  const onCreateSubfolderAdd = useCallback(() => {
    const newPath = localValue + (localValue === "/" ? "" : "/") + newSubfolderName;
    // If we either already have an identical drop box path, or an identical new subfolder, set an error and
    // exit early.
    if (valueSet.has(newPath)) {
      setNewSubfolderError(`New subfolder path '${newPath}' already exists`);
      return;
    }
    if (newTreeFolderPaths.has(newPath)) {
      setNewSubfolderError(`New subfolder path '${newPath}' already created`);
      return;
    }
    // Otherwise, create the new subfolder in-memory (doesn't persist to Drop Box until a file is uploaded):
    setNewTreeFolderEntries((entries) => {
      const newEntry = {
        value: newPath,
        // Tag new subfolders as "new" so that the user knows what *would* be created upon file upload (although with an
        // S3 backend, nothing is truly being created anyway!)
        title: (
          <span>
            {newSubfolderName} <Tag color="green">new</Tag>
          </span>
        ),
        isLeaf: true,
        selectable: true,
        children: [],
      };

      const rewriteLevel = (es: DropBoxTreeSelectData, flag: boolean): [DropBoxTreeSelectData, boolean] => [
        es.map((e) => {
          if (flag) {
            // Already flagged, no more searching to be done
            return e;
          } else if (e.value === localValue) {
            // Insertion spot is current folder; flag + rewrite entry
            flag = true;
            return { ...e, isLeaf: false, children: [...(e.children ?? []), newEntry] };
          } else if (e.children !== undefined) {
            // Not found insertion spot yet; search/rewrite children
            const [childrenRewrite, childrenFlag] = rewriteLevel(e.children, flag);
            flag = flag || childrenFlag;
            return { ...e, children: childrenRewrite };
          } else {
            // As-is (not a folder)
            return e;
          }
        }),
        flag,
      ];

      const [newEntries, flag] = rewriteLevel(entries, false);

      if (!flag) {
        // Either a new top-level entry or an entry nested into an existing folder
        newEntries.push(newEntry);
      }

      return newEntries;
    });
    setNewTreeFolderPaths((paths) => {
      const newPaths = new Set(paths);
      newPaths.add(newPath);
      return newPaths;
    });
    // Close/reset the subfolder creation form
    setIsCreatingSubfolder(false);
    setNewSubfolderName("");
    setNewSubfolderError("");
    // Janky update to value that skips onChange since Ant Design wants more data for the onChange event function.
    // If we have an onChange but no setValue param, the new subfolder will just not be auto-selected.
    if (setValue) {
      setValue(newPath);
    } else if (!onChange) {
      setLocalValue(newPath);
    }
  }, [localValue, newTreeFolderPaths, newSubfolderName, setValue]);

  return (
    <Flex vertical={true} gap={6}>
      <Flex gap={12}>
        <TreeSelect<string>
          showSearch={true}
          treeDefaultExpandAll={true}
          treeData={treeData}
          value={localValue}
          onChange={localOnChange}
          {...props}
        />
        {folderMode && allowFolderCreation ? (
          <>
            <div>
              <Switch value={showFilesInFolderMode} onChange={(e) => setShowFilesInFolderMode(e)} />
              Show files
            </div>
            <Button
              icon={<PlusOutlined />}
              disabled={isCreatingSubfolder || localValue === undefined}
              onClick={() => {
                setIsCreatingSubfolder(true);
              }}
            >
              Add Subfolder
            </Button>
          </>
        ) : null}
      </Flex>
      {isCreatingSubfolder ? (
        <Space.Compact>
          {localValue ? (
            <Space.Addon style={{ whiteSpace: "nowrap" }}>{localValue + (localValue === "/" ? "" : "/")}</Space.Addon>
          ) : null}
          <Input
            onChange={(e) => {
              setNewSubfolderName(e.target.value);
            }}
          />
          <Button icon={<CheckOutlined />} type="primary" disabled={!newSubfolderName} onClick={onCreateSubfolderAdd}>
            Add
          </Button>
          <Button icon={<CloseOutlined />} onClick={onCreateSubfolderCancel}>
            Cancel
          </Button>
        </Space.Compact>
      ) : null}
      {newSubfolderError && <ErrorText>{newSubfolderError}</ErrorText>}
    </Flex>
  );
};

export default DropBoxTreeSelect;
