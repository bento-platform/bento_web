import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";

import PropTypes from "prop-types";

import fetch from "cross-fetch";
import {filesize} from "filesize";

import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {a11yLight} from "react-syntax-highlighter/dist/cjs/styles/hljs";

import {Document, Page} from "react-pdf/dist/esm/entry.webpack5";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import {json, markdown, plaintext} from "react-syntax-highlighter/dist/cjs/languages/hljs";

import {
    Alert,
    Button,
    Descriptions,
    Dropdown,
    Empty,
    Form,
    Icon,
    Layout,
    Menu,
    Modal,
    Result,
    Spin,
    Statistic,
    Tree,
    Upload,
    message,
} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import DownloadButton from "./DownloadButton";
import DropBoxTreeSelect from "./DropBoxTreeSelect";
import JsonDisplay from "../JsonDisplay";
import TableSelectionModal from "./TableSelectionModal";

import {BENTO_DROP_BOX_FS_BASE_PATH} from "../../config";
import {STEP_INPUT} from "./workflowCommon";
import {dropBoxTreeStateToPropsMixinPropTypes, workflowsStateToPropsMixin} from "../../propTypes";
import {useAuthorizationHeader, useResourcePermissions} from "../../lib/auth/src/utils";
import {getFalse} from "../../utils/misc";
import {
    beginDropBoxPuttingObjects,
    endDropBoxPuttingObjects,
    fetchDropBoxTreeOrFail,
    putDropBoxObject,
    deleteDropBoxObject,
} from "../../modules/manager/actions";
import {RESOURCE_EVERYTHING} from "../../lib/auth/src/resources";
import {deleteDropBox, ingestDropBox} from "../../lib/auth/src/permissions";


SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);


const BASE_PDF_OPTIONS = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
};


const LANGUAGE_HIGHLIGHTERS = {
    ".bash": "bash",
    ".json": "json",
    ".md": "markdown",
    ".txt": "plaintext",
    ".py": "python",
    ".R": "r",
    ".sh": "shell",
    ".xml": "xml",

    // Special files
    "Dockerfile": "dockerfile",
    "README": "plaintext",
    "CHANGELOG": "plaintext",
};

const VIEWABLE_FILE_EXTENSIONS = [...Object.keys(LANGUAGE_HIGHLIGHTERS), ".pdf"];


const DROP_BOX_CONTENT_CONTAINER_STYLE = {display: "flex", flexDirection: "column", gap: "1em"};
const DROP_BOX_ACTION_CONTAINER_STYLE = {display: "flex", gap: "12px"};

const TREE_CONTAINER_STYLE = {position: "relative", minHeight: 72};

const TREE_DROP_ZONE_OVERLAY_STYLE = {
    position: "absolute",
    left: 0, top: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(176,223,255,0.6)",
    border: "2px dashed rgb(145, 213, 255)",
    zIndex: 10,
    padding: 12,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};
const TREE_DROP_ZONE_OVERLAY_ICON_STYLE = {fontSize: 48, color: "#1890ff"};


const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory) =>
    [...directory]
        .sort(sortByName)
        .map(entry => {
            const {name, contents, relativePath} = entry;
            const isFolder = contents !== undefined;
            return (
                <Tree.TreeNode title={name} key={relativePath} isLeaf={!isFolder}>
                    {isFolder ? generateFileTree(contents) : null}
                </Tree.TreeNode>
            );
        });

const generateURIsByRelPath = (entry, acc) => {
    if (Array.isArray(entry)) {
        entry.forEach(e => generateURIsByRelPath(e, acc));
    } else if (entry.uri) {
        acc[entry.relativePath] = entry.uri;
    } else if (entry.contents) {
        entry.contents.forEach(e => generateURIsByRelPath(e, acc));
    }
    return acc;
};

const recursivelyFlattenFileTree = (acc, contents) => {
    contents.forEach(c => {
        if (c.contents !== undefined) {
            recursivelyFlattenFileTree(acc, c.contents);
        } else {
            acc.push(c);
        }
    });
    return acc;
};

const formatTimestamp = timestamp => (new Date(timestamp * 1000)).toLocaleString();

const stopEvent = event => {
    event.preventDefault();
    event.stopPropagation();
};


const FileDisplay = ({file, tree, treeLoading}) => {
    const urisByFilePath = useMemo(() => generateURIsByRelPath(tree, {}), [tree]);

    const authHeader = useAuthorizationHeader();

    const [fileLoadError, setFileLoadError] = useState("");
    const [loadingFileContents, setLoadingFileContents] = useState(false);
    const [fileContents, setFileContents] = useState({});
    const [pdfPageCounts, setPdfPageCounts] = useState({});

    const pdfOptions = useMemo(() => ({
        ...BASE_PDF_OPTIONS,
        httpHeaders: authHeader,
    }), [authHeader]);

    let textFormat = false;
    if (file) {
        Object.keys(LANGUAGE_HIGHLIGHTERS).forEach(ext => {
            if (file.endsWith(ext)) {
                textFormat = true;
            }
        });
    }

    const fileExt = file ? file.split(".").slice(-1)[0] : null;

    useEffect(() => {
        // File changed, so reset the load error
        setFileLoadError("");

        (async () => {
            if (!file) return;

            if (fileExt === "pdf") {
                setLoadingFileContents(true);
            }

            if (!textFormat || fileContents.hasOwnProperty(file)) return;

            if (!(file in urisByFilePath)) {
                console.error(`Files: something went wrong while trying to load ${file}`);
                setFileLoadError("Could not find URI for file.");
                return;
            }

            try {
                setLoadingFileContents(true);
                const r = await fetch(urisByFilePath[file], {headers: authHeader});
                if (r.ok) {
                    const text = await r.text();
                    const content = (fileExt === "json" ? JSON.parse(text) : text);
                    setFileContents({
                        ...fileContents,
                        [file]: content,
                    });
                } else {
                    setFileLoadError(`Could not load file: ${r.content}`);
                }
            } catch (e) {
                console.error(e);
                setFileLoadError(`Could not load file: ${e.message}`);
            } finally {
                setLoadingFileContents(false);
            }
        })();
    }, [file]);

    const onPdfLoad = useCallback(({numPages}) => {
        setLoadingFileContents(false);
        setPdfPageCounts({...pdfPageCounts, [file]: numPages});
    }, [file]);

    const onPdfFail = useCallback(err => {
        console.error(err);
        setLoadingFileContents(false);
        setFileLoadError(`Error loading PDF: ${err.message}`);
    }, []);

    if (!file) return <div />;

    return <Spin spinning={treeLoading || loadingFileContents}>
        {(() => {
            if (fileLoadError) {
                return <Alert
                    type="error"
                    message={`Error loading file: ${file}`}
                    description={fileLoadError}
                />;
            }

            if (fileExt === "pdf") {  // Non-text, content isn't loaded a priori
                const uri = urisByFilePath[file];
                if (!uri) return <div />;
                return (
                    <Document file={uri} onLoadSuccess={onPdfLoad} onLoadError={onPdfFail} options={pdfOptions}>
                        {(() => {
                            const pages = [];
                            for (let i = 1; i <= pdfPageCounts[file] ?? 1; i++) {
                                pages.push(<Page pageNumber={i} key={i} />);
                            }
                            return pages;
                        })()}
                    </Document>
                );
            } else if (fileExt === "json") {
                const jsonSrc = fileContents[file];
                if (loadingFileContents || !jsonSrc) return <div />;
                return (<JsonDisplay jsonSrc={jsonSrc}/>);
            } else {  // if (textFormat)
                return (
                    <SyntaxHighlighter
                        language={LANGUAGE_HIGHLIGHTERS[`.${fileExt}`]}
                        style={a11yLight}
                        customStyle={{fontSize: "12px"}}
                        showLineNumbers={true}
                    >
                        {fileContents[file] || ""}
                    </SyntaxHighlighter>
                );
            }
        })()}
    </Spin>;
};
FileDisplay.propTypes = {
    file: PropTypes.string,
    ...dropBoxTreeStateToPropsMixinPropTypes,
};

const FileUploadForm = Form.create()(({initialUploadFolder, initialUploadFiles, form}) => {
    const getFileListFromEvent = useCallback(e => Array.isArray(e) ? e : e && e.fileList, []);

    useEffect(() => {
        if (!initialUploadFolder) return;
        form.setFieldsValue({"parent": initialUploadFolder});
    }, [initialUploadFolder]);

    useEffect(() => {
        if (!initialUploadFiles?.length) return;
        form.setFieldsValue({
            "files": initialUploadFiles.map((u, i) => ({
                // ...u doesn't work for File object
                lastModified: u.lastModified,
                name: u.name,
                size: u.size,
                type: u.type,

                uid: (-1 * (i + 1)).toString(),
                originFileObj: u,
            })),
        });
    }, [initialUploadFiles]);

    return <Form>
        <Form.Item label="Parent Folder">
            {form.getFieldDecorator("parent", {
                rules: [{required: true, message: "Please select a folder to upload into."}],
            })(<DropBoxTreeSelect folderMode={true} />)}
        </Form.Item>
        <Form.Item label="File">
            {form.getFieldDecorator("files", {
                valuePropName: "fileList",
                getValueFromEvent: getFileListFromEvent,
                rules: [{required: true, message: "Please specify at least one file to upload."}],
            })(<Upload beforeUpload={getFalse}><Button><Icon type="upload" /> Upload</Button></Upload>)}
        </Form.Item>
    </Form>;
});

const FileUploadModal = ({initialUploadFolder, initialUploadFiles, onCancel, visible}) => {
    const dispatch = useDispatch();
    const form = useRef(null);

    const isPutting = useSelector(state => state.dropBox.isPuttingFlow);

    useEffect(() => {
        if (visible && form.current) {
            // If we just re-opened the model, reset the fields
            form.current.resetFields();
        }
    }, [visible]);

    const onOk = () => {
        if (!form.current) {
            console.error("missing form ref");
            return;
        }

        form.current.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            (async () => {
                dispatch(beginDropBoxPuttingObjects());

                for (const file of values.files) {
                    if (!file.name) {
                        console.error("Cannot upload file with no name", file);
                        continue;
                    }

                    const path = `${values.parent.replace(/\/$/, "")}/${file.name}`;

                    try {
                        await dispatch(putDropBoxObject(path, file.originFileObj));
                    } catch (e) {
                        console.error(e);
                        message.error(`Error uploading file to drop box path: ${path}`);
                    }
                }

                // Reload the file tree with the newly-uploaded file(s)
                await dispatch(fetchDropBoxTreeOrFail());

                // Finish the object-putting flow
                dispatch(endDropBoxPuttingObjects());

                // Close ourselves (the upload modal)
                onCancel();
            })();
        });
    };

    return <Modal
        title="Upload"
        okButtonProps={{loading: isPutting}}
        onCancel={onCancel}
        visible={visible}
        onOk={onOk}
    >
        <FileUploadForm
            initialUploadFolder={initialUploadFolder}
            initialUploadFiles={initialUploadFiles}
            ref={ref => form.current = ref}
        />
    </Modal>;
};
FileUploadModal.propTypes = {
    initialUploadFolder: PropTypes.string,
    initialUploadFiles: PropTypes.arrayOf(PropTypes.instanceOf(File)),
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
};


const FileContentsModal = ({selectedFilePath, visible, onCancel}) => {
    const {tree, isFetching: treeLoading} = useSelector(state => state.dropBox);

    return <Modal
        visible={visible}
        title={selectedFilePath ? `${selectedFilePath.split("/").at(-1)} - contents` : ""}
        width={960}
        footer={null}
        onCancel={onCancel}
    >
        <FileDisplay file={selectedFilePath} tree={tree} treeLoading={treeLoading} />
    </Modal>;
};
FileContentsModal.propTypes = {
    selectedFilePath: PropTypes.string,
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
};


const DropBoxInformation = () => (
    <Alert type="info" showIcon={true} message="About the drop box" description={`
        The drop box contains files which are not yet ingested into this Bento instance. They are not
        organized in any particular structure; instead, this serves as a place for incoming data files to be
        deposited and examined.
    `} />
);

const DROP_BOX_ROOT_KEY = "/";


const ManagerDropBoxContent = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const {permissions, hasAttempted} = useResourcePermissions(RESOURCE_EVERYTHING) ?? {};

    const dropBoxService = useSelector(state => state.services.dropBoxService);
    const {tree, isFetching: treeLoading, isDeleting} = useSelector(state => state.dropBox);
    const ingestionWorkflows = useSelector(state => workflowsStateToPropsMixin(state).workflows.ingestion);

    const filesByPath = useMemo(() => Object.fromEntries(
        recursivelyFlattenFileTree([], tree).map(f => [f.relativePath, f])), [tree]);

    // Start with drop box root selected at first
    //  - Will enable the upload button so that users can quickly upload from initial page load
    const [selectedEntries, setSelectedEntries] = useState([DROP_BOX_ROOT_KEY]);
    const firstSelectedEntry = useMemo(() => selectedEntries[0], [selectedEntries]);

    const [draggingOver, setDraggingOver] = useState(false);

    const [initialUploadFolder, setInitialUploadFolder] = useState(null);
    const [initialUploadFiles, setInitialUploadFiles] = useState([]);
    const [uploadModal, setUploadModal] = useState(false);

    const [fileInfoModal, setFileInfoModal] = useState(false);
    const [fileContentsModal, setFileContentsModal] = useState(false);

    const [fileDeleteModal, setFileDeleteModal] = useState(false);

    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [tableSelectionModal, setTableSelectionModal] = useState(false);

    const showUploadModal = useCallback(() => setUploadModal(true), []);
    const hideUploadModal = useCallback(() => setUploadModal(false), []);
    const showFileInfoModal = useCallback(() => setFileInfoModal(true), []);
    const hideFileInfoModal = useCallback(() => setFileInfoModal(false), []);
    const showFileContentsModal = useCallback(() => setFileContentsModal(true), []);
    const hideFileContentsModal = useCallback(() => setFileContentsModal(false), []);

    const showTableSelectionModal = useCallback(workflow => {
        setSelectedWorkflow(workflow);
        setTableSelectionModal(true);
    }, []);
    const hideTableSelectionModal = useCallback(() => setTableSelectionModal(false), []);

    const getWorkflowFit = useCallback(w => {
        let workflowSupported = true;
        let filesLeft = [...selectedEntries];
        const inputs = {};

        for (const i of w.inputs.filter(i => i.type.startsWith("file"))) {
            const isFileArray = i.type.endsWith("[]");

            // Find tables that support the data type
            // TODO

            // Find files where 1+ of the valid extensions (e.g. jpeg or jpg) match.
            const compatibleFiles = filesLeft.filter(f => !!i.extensions.find(e => f.endsWith(e)));
            if (compatibleFiles.length === 0) {
                workflowSupported = false;
                break;
            }

            // Steal the first compatible file, or all if it's an array
            const filesToTake = filesLeft.filter(f =>
                isFileArray ? compatibleFiles.includes(f) : f === compatibleFiles[0]);

            inputs[i.id] = BENTO_DROP_BOX_FS_BASE_PATH + (isFileArray ? filesToTake : filesToTake[0]);
            filesLeft = filesLeft.filter(f => !filesToTake.includes(f));
        }

        if (filesLeft.length > 0) {
            // If there are unclaimed files remaining at the end, the workflow is not compatible with the
            // total selection of files.
            workflowSupported = false;
        }

        return [workflowSupported, inputs];
    }, [selectedEntries]);

    const ingestIntoTable = useCallback(tableKey => {
        history.push("/admin/data/manager/ingestion", {
            step: STEP_INPUT,
            workflowSelectionValues: {selectedTable: tableKey},
            selectedWorkflow,
            initialInputValues: getWorkflowFit(selectedWorkflow)[1],
        });
    }, [history, selectedWorkflow]);

    const handleViewFile = useCallback(() => {
        showFileContentsModal();
    }, []);

    const workflowsSupported = useMemo(
        () => ingestionWorkflows.filter(w => getWorkflowFit(w)[0]),
        [ingestionWorkflows]);

    const workflowMenu = (
        <Menu>
            {ingestionWorkflows.map(w => (
                <Menu.Item key={w.id}
                           disabled={workflowsSupported.findIndex(w2 => w2.id === w.id) === -1}
                           onClick={() => showTableSelectionModal(w)}>
                    Ingest with Workflow &ldquo;{w.name}&rdquo;
                </Menu.Item>
            ))}
        </Menu>
    );

    const handleIngest = useCallback(() => {
        if (workflowsSupported.length !== 1) return;
        showTableSelectionModal(workflowsSupported[0]);
    }, [workflowsSupported]);

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
    const handleDrop = useCallback(event => {
        stopEvent(event);
        if (!hasUploadPermission) return;

        setDraggingOver(false);

        const items = event.dataTransfer?.items ?? [];

        for (const dti of items) {
            // If we have the webkitGetAsEntry() or getAsEntry() function, we can validate
            // if the dropped item is a folder and show a nice error.

            if ((typeof dti?.webkitGetAsEntry) === "function") {
                const entry = dti.webkitGetAsEntry();
                if (!entry) {
                    return;  // Not a file at all, some random element from the page maybe - exit silently
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

        setInitialUploadFolder(DROP_BOX_ROOT_KEY);  // Root by default
        setInitialUploadFiles(Array.from(event.dataTransfer.files));
        showUploadModal();
    }, [showUploadModal, hasUploadPermission]);

    const selectedFolder = selectedEntries.length === 1 && filesByPath[firstSelectedEntry] === undefined;

    const hideFileDeleteModal = useCallback(() => setFileDeleteModal(false), []);
    const showFileDeleteModal = useCallback(() => {
        if (selectedEntries.length !== 1 || selectedFolder) return;
        setFileDeleteModal(true);
    }, [selectedEntries, selectedFolder]);
    const handleDelete = useCallback(() => {
        if (selectedEntries.length !== 1 || selectedFolder) return;
        (async () => {
            await dispatch(deleteDropBoxObject(firstSelectedEntry));
            hideFileDeleteModal();
        })();
    }, [dispatch, selectedEntries]);

    const selectedFileViewable = selectedEntries.length === 1 && !selectedFolder &&
        VIEWABLE_FILE_EXTENSIONS.filter(e => firstSelectedEntry.endsWith(e)).length > 0;

    const selectedFileInfoAvailable = selectedEntries.length === 1 && firstSelectedEntry in filesByPath;
    const fileForInfo = selectedFileInfoAvailable ? firstSelectedEntry : "";

    const uploadDisabled = !selectedFolder || !hasUploadPermission;
    // TODO: at least one ingest:data on all datasets vvv
    const ingestIntoDatasetDisabled = !dropBoxService ||
        selectedEntries.length === 0 || workflowsSupported.length === 0;

    const handleUpload = useCallback(() => {
        if (selectedFolder) setInitialUploadFolder(selectedEntries[0]);
        showUploadModal();
    }, [selectedFolder, selectedEntries]);

    const deleteDisabled = !dropBoxService || selectedFolder || selectedEntries.length !== 1 || !hasDeletePermission;

    if (hasAttempted && !hasUploadPermission) {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Result status="error" title="Forbidden" subTitle="You do not have permission to view the drop box." />
            </Layout.Content>
        </Layout>;
    }

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE} onDragLeave={handleContainerDragLeave}>
            {/* ----------------------------- Start of modals section ----------------------------- */}

            <FileUploadModal
                initialUploadFolder={initialUploadFolder}
                initialUploadFiles={initialUploadFiles}
                visible={uploadModal}
                onCancel={hideUploadModal}
            />

            <TableSelectionModal
                dataType={selectedWorkflow?.data_type || null}
                visible={tableSelectionModal}
                title="Select a Table to Ingest Into"
                onCancel={hideTableSelectionModal}
                onOk={tableKey => ingestIntoTable(tableKey)}
            />

            <FileContentsModal
                selectedFilePath={selectedEntries.length === 1 ? firstSelectedEntry : null}
                visible={fileContentsModal}
                onCancel={hideFileContentsModal}
            />

            <Modal visible={fileInfoModal}
                   title={`${fileForInfo.split("/").at(-1)} - information`}
                   width={960}
                   footer={[<DownloadButton key="download" uri={filesByPath[fileForInfo]?.uri} />]}
                   onCancel={hideFileInfoModal}>
                <Descriptions bordered={true}>
                    <Descriptions.Item label="Name" span={3}>
                        {fileForInfo.split("/").at(-1)}</Descriptions.Item>
                    <Descriptions.Item label="Path" span={3}>{fileForInfo}</Descriptions.Item>
                    <Descriptions.Item label="Size" span={3}>
                        {filesize(filesByPath[fileForInfo]?.size ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Last Modified" span={3}>
                        {formatTimestamp(filesByPath[fileForInfo]?.lastModified ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Last Metadata Change" span={3}>
                        {formatTimestamp(filesByPath[fileForInfo]?.lastMetadataChange ?? 0)}
                    </Descriptions.Item>
                </Descriptions>
            </Modal>

            <Modal visible={fileDeleteModal}
                   title={`Are you sure you want to delete '${firstSelectedEntry.split("/").at(-1)}'?`}
                   okType="danger"
                   okText="Delete"
                   okButtonProps={{loading: isDeleting}}
                   onOk={handleDelete}
                   onCancel={hideFileDeleteModal}>
                Doing so will permanently and irrevocably remove this file from the drop box. It will then be
                unavailable for any ingestion or analysis.
            </Modal>

            {/* ------------------------------ End of modals section ------------------------------ */}

            <div style={DROP_BOX_CONTENT_CONTAINER_STYLE}>
                <div style={DROP_BOX_ACTION_CONTAINER_STYLE}>
                    <Button icon="upload" onClick={handleUpload} disabled={uploadDisabled}>Upload</Button>
                    <Dropdown.Button overlay={workflowMenu} disabled={ingestIntoDatasetDisabled} onClick={handleIngest}>
                        <Icon type="import" /> Ingest
                    </Dropdown.Button>

                    <Button.Group>
                        <Button icon="info-circle" onClick={showFileInfoModal} disabled={!selectedFileInfoAvailable}>
                            File Info
                        </Button>
                        <Button icon="file-text" onClick={handleViewFile} disabled={!selectedFileViewable}>
                            View
                        </Button>
                        <DownloadButton disabled={!selectedFileInfoAvailable} uri={filesByPath[fileForInfo]?.uri} />
                    </Button.Group>

                    <Button type="danger"
                            icon="delete"
                            disabled={deleteDisabled}
                            loading={isDeleting}
                            onClick={showFileDeleteModal}>
                        Delete</Button>
                </div>

                <Spin spinning={treeLoading}>
                    {(treeLoading || dropBoxService) ? (
                        <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={stopEvent}
                            onDrop={handleDrop}
                            style={TREE_CONTAINER_STYLE}
                        >
                            {draggingOver && <div style={TREE_DROP_ZONE_OVERLAY_STYLE}>
                                <Icon type="plus-circle" style={TREE_DROP_ZONE_OVERLAY_ICON_STYLE} />
                            </div>}
                            <Tree.DirectoryTree
                                defaultExpandAll={true}
                                multiple={true}
                                expandAction="doubleClick"
                                onSelect={setSelectedEntries}
                                selectedKeys={selectedEntries}
                            >
                                <Tree.TreeNode title="Drop Box" key={DROP_BOX_ROOT_KEY}>
                                    {generateFileTree(tree, "")}
                                </Tree.TreeNode>
                            </Tree.DirectoryTree>
                        </div>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                               description="Encountered an error while trying to access the drop box service" />}
                </Spin>

                <Statistic
                    title="Total Space Used"
                    value={treeLoading
                        ? "—"
                        : filesize(Object.values(filesByPath).reduce((acc, f) => acc + f.size, 0))}
                />

                <DropBoxInformation />
            </div>
        </Layout.Content>
    </Layout>;
};

export default ManagerDropBoxContent;
