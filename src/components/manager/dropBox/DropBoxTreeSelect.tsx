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

  // We're accumulating all values in an array as we traverse the tree:
  valueAcc.push(...sortedDir.map(({ relativePath }) => relativePath));

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

  // Collect any new subfolders that are alongside existing (sub)folders in the entry we're currently processing
  // children of, and append them to the results array.
  res.push(...newFolderEntries.filter((e) => _isDirectSubItem(currentPath, e.value! as string)));

  return res;
};

type AddSubfolderFormProps = {
  currentPath?: string;
  onAdd?: (name: string) => boolean;
  onCancel?: () => void;
};

/**
 * Form for adding a subfolder to render in the drop box tree, presumably for uploading files to a new subfolder
 * location in the drop box.
 * @param currentPath - currently selected path, to create the subfolder under.
 * @param onAdd - function to call on add; returns a Boolean of whether the addition succeeded.
 * @param onCancel - function to call on cancellation.
 * @constructor
 */
const AddSubfolderForm = ({ currentPath, onAdd, onCancel }: AddSubfolderFormProps) => {
  const [newSubfolderName, setNewSubfolderName] = useState("");

  const onCreateSubfolderAdd = useCallback(() => {
    let res = true;
    if (onAdd) {
      res = onAdd(newSubfolderName);
    }
    if (res) {
      setNewSubfolderName("");
    }
  }, [newSubfolderName, onAdd]);

  const onCreateSubfolderCancel = useCallback(() => {
    setNewSubfolderName("");
    if (onCancel) onCancel();
  }, [onCancel]);

  return (
    <Space.Compact>
      {currentPath ? (
        <Space.Addon style={{ whiteSpace: "nowrap" }}>{currentPath + (currentPath === "/" ? "" : "/")}</Space.Addon>
      ) : null}
      <Input
        value={newSubfolderName}
        onChange={(e) => {
          setNewSubfolderName(e.target.value.replaceAll(/[\s/*]/g, "_"));
        }}
      />
      <Button icon={<CheckOutlined />} type="primary" disabled={!newSubfolderName} onClick={onCreateSubfolderAdd}>
        Add
      </Button>
      <Button icon={<CloseOutlined />} onClick={onCreateSubfolderCancel}>
        Cancel
      </Button>
    </Space.Compact>
  );
};

export type DropBoxTreeSelectProps = Omit<TreeSelectProps, "showSearch" | "treeDefaultExpandAll" | "treeData"> & {
  folderMode?: boolean;
  allowFolderCreation?: boolean;
  nodeEnabled?: DropBoxEntryValidFunction;
  setValue?: (value: string) => void;
  onSubfolderAddingChange?: (value: boolean) => void;
};

const DropBoxTreeSelect = ({
  folderMode = false,
  allowFolderCreation = false,
  nodeEnabled,
  value,
  setValue,
  onChange,
  onSubfolderAddingChange,
  ...props
}: DropBoxTreeSelectProps) => {
  const { tree } = useDropBox();

  // If the component isn't in a form context, we manage state locally.
  const [localValue, setLocalValue] = useState<string | undefined>(value);

  // If the controlled value changes, update the local state value; using a value parameter should always override the
  // local state with form input components.
  useEffect(() => setLocalValue(value), [value]);

  const [showFilesInFolderMode, setShowFilesInFolderMode] = useState(false);
  const [isAddingSubfolder, setIsAddingSubfolder] = useState(false);
  const [newSubfolderError, setNewSubfolderError] = useState("");

  const [newTreeFolderPaths, setNewTreeFolderPaths] = useState<Set<string>>(new Set());
  const [newTreeFolderEntries, setNewTreeFolderEntries] = useState<DropBoxTreeSelectData>([]);

  const [treeData, valueSet] = useMemo(() => {
    const valueAcc: string[] = [];
    const root = {
      value: "/",
      title: "Drop Box",
      selectable: folderMode,
      children: generateFileTree(
        tree,
        newTreeFolderEntries,
        nodeEnabled ?? getTrue,
        folderMode,
        showFilesInFolderMode,
        "/",
        valueAcc,
      ),
    };
    return [[root], new Set(["/", ...valueAcc])];
  }, [tree, nodeEnabled, folderMode, showFilesInFolderMode, newTreeFolderEntries]);

  // Local on-change event handler, which either sets the local state value directly or, in the case of a controlled
  // input (i.e., used in an Antd form), calls the onChange handler.
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

  const showAddSubfolderForm = useCallback(() => {
    setIsAddingSubfolder(true);
    if (onSubfolderAddingChange) onSubfolderAddingChange(true);
  }, [onSubfolderAddingChange]);
  const hideAddSubfolderForm = useCallback(() => {
    setIsAddingSubfolder(false);
    setNewSubfolderError("");
    if (onSubfolderAddingChange) onSubfolderAddingChange(false);
  }, [onSubfolderAddingChange]);

  const onAddSubfolder = useCallback(
    (newSubfolderName: string): boolean => {
      newSubfolderName = newSubfolderName.trim();

      if (["", ".", ".."].includes(newSubfolderName)) {
        setNewSubfolderError("Illegal new subfolder name");
        return false;
      }

      const newPath = localValue + (localValue === "/" ? "" : "/") + newSubfolderName;
      // If we either already have an identical drop box path, or an identical new subfolder, set an error and
      // exit early.
      if (valueSet.has(newPath)) {
        setNewSubfolderError(`New subfolder path '${newPath}' already exists`);
        return false;
      }
      if (newTreeFolderPaths.has(newPath)) {
        setNewSubfolderError(`New subfolder path '${newPath}' already added`);
        return false;
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

        /**
         * Rewrite levels of the *new* subfolder tree data (which is sort of separate from the main drop box tree data;
         * top level elements here are either true new root subfolders, or need to be inserted into the main tree.) This
         * handles nesting new subfolders inside other new subfolders by inserting them as children.
         * @param es - drop box tree data array (a tree level) for the Antd TreeSelect component
         * @param flag - whether the new entry has been correctly rooted + inserted yet
         */
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
          // If the flag isn't set, it means we didn't find the parent in the above traversal of other new subfolders.
          // This means we have either a new top-level entry or an entry nested into an existing drop box folder.
          newEntries.push(newEntry);
        }

        return newEntries;
      });
      // We track all 'new' (in-memory for this upload) subfolder paths in a set in addition to in objects, so we can
      // quickly check if, when adding a new one, it has already been added.
      setNewTreeFolderPaths((paths) => new Set(paths).add(newPath));
      // Close/reset the subfolder creation form
      hideAddSubfolderForm();
      // Janky update to value that skips onChange since Ant Design wants more data for the onChange event function.
      // If we have an onChange but no setValue param, the new subfolder will just not be auto-selected.
      if (setValue) {
        setValue(newPath);
      } else if (!onChange) {
        setLocalValue(newPath);
      }
      return true;
    },
    [localValue, newTreeFolderPaths, setValue, onChange, valueSet, hideAddSubfolderForm],
  );

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
              disabled={isAddingSubfolder || localValue === undefined}
              onClick={showAddSubfolderForm}
            >
              Add Subfolder
            </Button>
          </>
        ) : null}
      </Flex>
      {isAddingSubfolder ? (
        <AddSubfolderForm currentPath={localValue} onAdd={onAddSubfolder} onCancel={hideAddSubfolderForm} />
      ) : null}
      {newSubfolderError && <ErrorText>{newSubfolderError}</ErrorText>}
    </Flex>
  );
};

export default DropBoxTreeSelect;
