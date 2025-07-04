import { useCallback, useMemo, useState } from "react";
import { RESOURCE_EVERYTHING, deleteDropBox, ingestDropBox, viewDropBox } from "bento-auth-js";

import { filesize } from "filesize";

import {
  Button,
  Descriptions,
  Dropdown,
  Empty,
  Input,
  Layout,
  Modal,
  Spin,
  Statistic,
  Tree,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import DownloadButton from "@/components/common/DownloadButton";
import PermissionsGate from "@/components/PermissionsGate";
import DropBoxInformation from "./DropBoxInformation";
import FileContentsModal from "./FileContentsModal";
import FileUploadModal from "./FileUploadModal";
import ActionContainer from "../ActionContainer";

import { VIEWABLE_FILE_EXTENSIONS } from "@/components/display/FileDisplay";
import { useResourcePermissionsWrapper } from "@/hooks";
import { deleteDropBoxObject } from "@/modules/dropBox/actions";
import { useDropBox } from "@/modules/dropBox/hooks";
import { useService, useWorkflows } from "@/modules/services/hooks";
import { useAppDispatch } from "@/store";
import { testFileAgainstPattern } from "@/utils/files";

import { useStartIngestionFlow } from "../workflowCommon";

import { sortByName } from "./common";

const DROP_BOX_CONTENT_CONTAINER_STYLE = { display: "flex", flexDirection: "column", gap: 8 };
const DROP_BOX_INFO_CONTAINER_STYLE = { display: "flex", gap: "2em", paddingTop: 8 };

const TREE_CONTAINER_STYLE = { minHeight: 72, overflowY: "auto" };

const TREE_DROP_ZONE_OVERLAY_STYLE = {
  position: "absolute",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(176,223,255,0.6)",
  border: "2px dashed rgb(145, 213, 255)",
  zIndex: 10,
  padding: 12,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const TREE_DROP_ZONE_OVERLAY_ICON_STYLE = { fontSize: 48, color: "#1890ff" };

const VIEW_DROP_BOX_CHECK = { resource: RESOURCE_EVERYTHING, requiredPermissions: [viewDropBox] };

const generateFileTree = (directory) =>
  [...directory].sort(sortByName).map(({ name: title, contents, relativePath: key }) => ({
    title,
    key,
    ...(contents !== undefined ? { children: generateFileTree(contents) } : { isLeaf: true }),
  }));

const recursivelyFlattenFileTree = (acc, contents) => {
  contents.forEach((c) => {
    if (c.contents !== undefined) {
      recursivelyFlattenFileTree(acc, c.contents);
    } else {
      acc.push(c);
    }
  });
  return acc;
};

const formatTimestamp = (timestamp) => new Date(timestamp * 1000).toLocaleString();

const stopEvent = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const DROP_BOX_ROOT_KEY = "/";

const filterTree = (nodes, searchTerm) => {
  return nodes.reduce((acc, node) => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm);
    const filteredChildren = node.children ? filterTree(node.children, searchTerm) : [];
    const hasMatchingChildren = filteredChildren.length > 0;

    if (matchesSearch || hasMatchingChildren) {
      acc.push({
        ...node,
        children: filteredChildren,
      });
    }

    return acc;
  }, []);
};

const ManagerDropBoxContent = () => {
  const dispatch = useAppDispatch();

  const { permissions, isFetchingPermissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

  const dropBoxService = useService("drop-box");
  const { tree, isFetching: treeLoading, isDeleting } = useDropBox();

  const { workflowsByType } = useWorkflows();
  const { items: ingestionWorkflows, itemsByID: ingestionWorkflowsByID } = workflowsByType.ingestion;

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = useCallback((event) => {
    const newSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);
    setSelectedEntries(newSearchTerm === "" ? [DROP_BOX_ROOT_KEY] : []);
  }, []);

  const filesByPath = useMemo(
    () => Object.fromEntries(recursivelyFlattenFileTree([], tree).map((f) => [f.relativePath, f])),
    [tree],
  );

  const treeData = useMemo(() => {
    const unfilteredTree = generateFileTree(tree);
    return [
      {
        title: "Drop Box",
        key: DROP_BOX_ROOT_KEY,
        children: filterTree(unfilteredTree, searchTerm),
      },
    ];
  }, [tree, searchTerm]);

  // Start with drop box root selected at first
  //  - Will enable the upload button so that users can quickly upload from initial page load
  const [selectedEntries, setSelectedEntries] = useState([DROP_BOX_ROOT_KEY]);
  const firstSelectedEntry = selectedEntries[0];

  const [draggingOver, setDraggingOver] = useState(false);

  const [initialUploadFolder, setInitialUploadFolder] = useState(undefined);
  const [initialUploadFiles, setInitialUploadFiles] = useState([]);
  const [uploadModal, setUploadModal] = useState(false);

  const [fileInfoModal, setFileInfoModal] = useState(false);
  const [fileContentsModal, setFileContentsModal] = useState(false);

  const [fileDeleteModal, setFileDeleteModal] = useState(false);
  const [fileDeleteModalTitle, setFileDeleteModalTitle] = useState(""); // cache to allow close animation

  const showUploadModal = useCallback(() => setUploadModal(true), []);
  const hideUploadModal = useCallback(() => setUploadModal(false), []);
  const showFileInfoModal = useCallback(() => setFileInfoModal(true), []);
  const hideFileInfoModal = useCallback(() => setFileInfoModal(false), []);
  const showFileContentsModal = useCallback(() => setFileContentsModal(true), []);
  const hideFileContentsModal = useCallback(() => setFileContentsModal(false), []);

  const getWorkflowFit = useCallback(
    (w) => {
      let workflowSupported = true;
      let entriesLeft = [...selectedEntries];

      const inputs = {};

      for (const i of w.inputs) {
        const isArray = i.type.endsWith("[]");
        const isFileType = i.type.startsWith("file");
        const isDirType = i.type.startsWith("directory");

        if (!isFileType && !isDirType) {
          continue; // Nothing for us to do with non-file/directory inputs
        }

        // Find compatible entries which match the specified pattern if one is given.
        const compatEntries = entriesLeft.filter(
          (e) => (isFileType ? !e.contents : e.contents !== undefined) && testFileAgainstPattern(e, i.pattern),
        );
        if (compatEntries.length === 0) {
          workflowSupported = false;
          break;
        }

        // Steal the first compatible entry, or all if it's an array
        const entriesToTake = entriesLeft.filter((e) => (isArray ? compatEntries.includes(e) : e === compatEntries[0]));
        inputs[i.id] = isArray ? entriesToTake : entriesToTake[0];
        entriesLeft = entriesLeft.filter((f) => !entriesToTake.includes(f));
      }

      if (entriesLeft.length > 0) {
        // If there are unclaimed files remaining at the end, the workflow is not compatible with the
        // total selection of files.
        workflowSupported = false;
      }

      return [workflowSupported, inputs];
    },
    [selectedEntries],
  );

  const startIngestionFlow = useStartIngestionFlow();

  const handleViewFile = useCallback(() => {
    showFileContentsModal();
  }, [showFileContentsModal]);

  const workflowsSupported = useMemo(
    () => Object.fromEntries(ingestionWorkflows.map((w) => [w.id, getWorkflowFit(w)])),
    [ingestionWorkflows, getWorkflowFit],
  );

  const workflowMenuItemClick = useCallback(
    (i) => startIngestionFlow(ingestionWorkflowsByID[i.key], workflowsSupported[i.key][1]),
    [ingestionWorkflowsByID, startIngestionFlow, workflowsSupported],
  );

  const workflowMenu = useMemo(
    () => ({
      onClick: workflowMenuItemClick,
      items: ingestionWorkflows.map((w) => ({
        key: w.id,
        disabled: !workflowsSupported[w.id][0],
        label: <>Ingest with Workflow &ldquo;{w.name}&rdquo;</>,
      })),
    }),
    [workflowMenuItemClick, ingestionWorkflows, workflowsSupported],
  );

  const handleIngest = useCallback(() => {
    const wfs = Object.entries(workflowsSupported).filter(([_, ws]) => ws[0]);
    if (wfs.length !== 1) return;
    const [wfID, wfSupportedTuple] = wfs[0];
    startIngestionFlow(ingestionWorkflowsByID[wfID], wfSupportedTuple[1]);
  }, [ingestionWorkflowsByID, workflowsSupported, startIngestionFlow]);

  const hasUploadPermission = permissions.includes(ingestDropBox);
  const hasDeletePermission = permissions.includes(deleteDropBox);

  const handleContainerDragLeave = useCallback(() => setDraggingOver(false), []);
  const handleDragEnter = useCallback(() => setDraggingOver(true), []);
  const handleDragLeave = useCallback((e) => {
    // Drag end is a bit weird - it's fired when the drag leaves any CHILD element (or the element itself).
    // So we set a parent event on the layout, and stop propagation here - that way the parent's dragLeave
    // only fires if we leave the drop zone.
    stopEvent(e);
  }, []);
  const handleDrop = useCallback(
    (event) => {
      stopEvent(event);
      if (!hasUploadPermission) return;

      setDraggingOver(false);

      const items = event.dataTransfer?.items ?? [];

      for (const dti of items) {
        // If we have the webkitGetAsEntry() or getAsEntry() function, we can validate
        // if the dropped item is a folder and show a nice error.

        if (typeof dti?.webkitGetAsEntry === "function") {
          const entry = dti.webkitGetAsEntry();
          if (!entry) {
            return; // Not a file at all, some random element from the page maybe - exit silently
          }
          if (entry.isDirectory) {
            message.error("Uploading a directory is not supported!");
            return;
          }
        } else if (typeof dti?.getAsEntry === "function") {
          // noinspection JSUnresolvedReference
          if (dti?.getAsEntry().isDirectory) {
            message.error("Uploading a directory is not supported!");
            return;
          }
        }
      }

      setInitialUploadFolder(DROP_BOX_ROOT_KEY); // Root by default
      setInitialUploadFiles(Array.from(event.dataTransfer.files));
      showUploadModal();
    },
    [showUploadModal, hasUploadPermission],
  );

  const selectedFolder = selectedEntries.length === 1 && filesByPath[firstSelectedEntry] === undefined;

  const hideFileDeleteModal = useCallback(() => setFileDeleteModal(false), []);
  const showFileDeleteModal = useCallback(() => {
    if (selectedEntries.length !== 1 || selectedFolder) return;
    // Only set this on open - don't clear it on close, so we don't get a strange effect on modal close where the
    // title disappears before the modal.
    setFileDeleteModalTitle(`Are you sure you want to delete '${(firstSelectedEntry ?? "").split("/").at(-1)}'?`);
    setFileDeleteModal(true);
  }, [selectedEntries, selectedFolder, firstSelectedEntry]);
  const handleDelete = useCallback(() => {
    if (selectedEntries.length !== 1 || selectedFolder) return;
    (async () => {
      await dispatch(deleteDropBoxObject(firstSelectedEntry));
      hideFileDeleteModal();
      setSelectedEntries([DROP_BOX_ROOT_KEY]);
    })();
  }, [dispatch, selectedEntries, selectedFolder, firstSelectedEntry, hideFileDeleteModal]);

  const selectedFileViewable =
    selectedEntries.length === 1 &&
    !selectedFolder &&
    VIEWABLE_FILE_EXTENSIONS.filter((e) => firstSelectedEntry.toLowerCase().endsWith(e)).length > 0;

  const selectedFileInfoAvailable = selectedEntries.length === 1 && firstSelectedEntry in filesByPath;
  const fileForInfo = selectedFileInfoAvailable ? firstSelectedEntry : "";

  const uploadDisabled = !selectedFolder || !hasUploadPermission;
  // TODO: at least one ingest:data on all datasets vvv
  const ingestIntoDatasetDisabled =
    !dropBoxService ||
    selectedEntries.length === 0 ||
    Object.values(workflowsSupported).filter((w) => w[0]).length === 0;

  const handleUpload = useCallback(() => {
    if (!hasUploadPermission) return;
    if (selectedFolder) setInitialUploadFolder(selectedEntries[0]);
    showUploadModal();
  }, [hasUploadPermission, selectedFolder, selectedEntries, showUploadModal]);

  const deleteDisabled = !dropBoxService || selectedFolder || selectedEntries.length !== 1 || !hasDeletePermission;

  return (
    <PermissionsGate check={VIEW_DROP_BOX_CHECK} forbiddenMessage="You do not have permission to view the drop box.">
      <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE} onDragLeave={handleContainerDragLeave}>
          {/* ----------------------------- Start of modals section ----------------------------- */}

          <FileUploadModal
            initialUploadFolder={initialUploadFolder}
            initialUploadFiles={initialUploadFiles}
            open={uploadModal}
            onCancel={hideUploadModal}
          />

          <FileContentsModal
            selectedFilePath={selectedEntries.length === 1 ? firstSelectedEntry : undefined}
            open={fileContentsModal}
            onCancel={hideFileContentsModal}
          />

          <Modal
            open={fileInfoModal}
            title={`${fileForInfo.split("/").at(-1)} - information`}
            width={960}
            footer={[<DownloadButton key="download" uri={filesByPath[fileForInfo]?.uri} />]}
            onCancel={hideFileInfoModal}
          >
            <Descriptions bordered={true}>
              <Descriptions.Item label="Name" span={3}>
                {fileForInfo.split("/").at(-1)}
              </Descriptions.Item>
              <Descriptions.Item label="Path" span={3}>
                {fileForInfo}
              </Descriptions.Item>
              <Descriptions.Item label="Size" span={3}>
                {filesize(filesByPath[fileForInfo]?.size ?? 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Modified" span={3}>
                {formatTimestamp(filesByPath[fileForInfo]?.lastModified ?? 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Metadata Change" span={3}>
                {formatTimestamp(filesByPath[fileForInfo]?.lastMetadataChange ?? 0)}
              </Descriptions.Item>
            </Descriptions>
          </Modal>

          <Modal
            open={fileDeleteModal}
            title={fileDeleteModalTitle}
            okType="danger"
            okText="Delete"
            okButtonProps={{ loading: isDeleting }}
            onOk={handleDelete}
            onCancel={hideFileDeleteModal}
          >
            Doing so will permanently and irrevocably remove this file from the drop box. It will then be unavailable
            for any ingestion or analysis.
          </Modal>

          {/* ------------------------------ End of modals section ------------------------------ */}

          <div style={DROP_BOX_CONTENT_CONTAINER_STYLE}>
            <ActionContainer>
              <Button icon={<UploadOutlined />} onClick={handleUpload} disabled={uploadDisabled}>
                Upload
              </Button>

              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={handleSearchChange}
                allowClear={true}
                style={{ marginBottom: 8, maxWidth: 300 }}
              />

              <Dropdown.Button
                menu={workflowMenu}
                disabled={ingestIntoDatasetDisabled}
                onClick={handleIngest}
                style={{ width: "auto" }}
              >
                <ImportOutlined /> Ingest
              </Dropdown.Button>

              <Button.Group>
                <Button icon={<InfoCircleOutlined />} onClick={showFileInfoModal} disabled={!selectedFileInfoAvailable}>
                  File Info
                </Button>
                <Button icon={<FileTextOutlined />} onClick={handleViewFile} disabled={!selectedFileViewable}>
                  View
                </Button>
                <DownloadButton
                  disabled={!selectedFileInfoAvailable}
                  uri={filesByPath[fileForInfo]?.uri}
                  fileName={fileForInfo}
                />
              </Button.Group>

              <Button
                danger={true}
                icon={<DeleteOutlined />}
                disabled={deleteDisabled}
                loading={isDeleting}
                onClick={showFileDeleteModal}
              >
                Delete
              </Button>

              <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                {selectedEntries.length} item{selectedEntries.length === 1 ? "" : "s"} selected
              </Typography.Text>
            </ActionContainer>

            <Spin spinning={isFetchingPermissions || treeLoading}>
              {isFetchingPermissions || treeLoading || dropBoxService ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={stopEvent}
                  onDrop={handleDrop}
                  style={TREE_CONTAINER_STYLE}
                >
                  {draggingOver && (
                    <div style={TREE_DROP_ZONE_OVERLAY_STYLE}>
                      <PlusCircleOutlined style={TREE_DROP_ZONE_OVERLAY_ICON_STYLE} />
                    </div>
                  )}
                  <Tree.DirectoryTree
                    defaultExpandAll={true}
                    multiple={true}
                    expandAction="doubleClick"
                    onSelect={setSelectedEntries}
                    selectedKeys={selectedEntries}
                    treeData={treeData}
                  />
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Encountered an error while trying to access the drop box service"
                />
              )}
            </Spin>

            <div style={DROP_BOX_INFO_CONTAINER_STYLE}>
              <Statistic
                title="Total Space Used"
                value={treeLoading ? "—" : filesize(Object.values(filesByPath).reduce((acc, f) => acc + f.size, 0))}
              />
              <DropBoxInformation style={{ flex: 1 }} />
            </div>
          </div>
        </Layout.Content>
      </Layout>
    </PermissionsGate>
  );
};

export default ManagerDropBoxContent;
