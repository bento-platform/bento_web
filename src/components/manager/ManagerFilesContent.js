import React, {useCallback, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router-dom";

import PropTypes from "prop-types";

import fetch from "cross-fetch";

import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {a11yLight} from "react-syntax-highlighter/dist/cjs/styles/hljs";

import ReactJson from "react-json-view";

import {json, markdown, plaintext} from "react-syntax-highlighter/dist/cjs/languages/hljs";

import {Button, Descriptions, Dropdown, Empty, Icon, Layout, Menu, Modal, Spin, Statistic, Tree} from "antd";


import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import TableSelectionModal from "./TableSelectionModal";

import {STEP_INPUT} from "./ingestion";
import {withBasePath} from "../../utils/url";
import {workflowsStateToPropsMixin} from "../../propTypes";


SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);


const LANGUAGE_HIGHLIGHTERS = {
    ".json": "json",
    ".md": "markdown",
    ".txt": "plaintext",

    // Special files
    "README": "plaintext",
    "CHANGELOG": "plaintext",
};


const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = directory => [...directory].sort(sortByName).map(entry =>
    <Tree.TreeNode title={entry.name} key={entry.filePath} isLeaf={!entry.hasOwnProperty("contents")}>
        {entry?.contents ? generateFileTree(entry.contents) : null}
    </Tree.TreeNode>);

const generateURIsByFilePath = (entry, acc) => {
    if (Array.isArray(entry)) {
        entry.forEach(e => generateURIsByFilePath(e, acc));
    } else if (entry.uri) {
        acc[entry.filePath] = entry.uri;
    } else if (entry.contents) {
        entry.contents.forEach(e => generateURIsByFilePath(e, acc));
    }
    return acc;
};

const resourceLoadError = resource => `An error was encountered while loading ${resource}`;


const recursivelyFlattenFileTree = (acc, contents) => {
    contents.forEach(c => {
        if (c.contents) {
            recursivelyFlattenFileTree(acc, c.contents);
        } else {
            acc.push(c);
        }
    });
    return acc;
};

const suffixes = ["bytes", "KB", "MB", "GB"];
const formatSize = size => {
    for (let i = 0; i < suffixes.length - 1; i++) {
        if (size < Math.pow(1000, i + 1)) {
            return `${(size / Math.pow(1000, i)).toFixed(1)} ${suffixes[i]}`;
        }
    }
    return `${(size / Math.pow(1000, suffixes.length - 1)).toFixed(1)} ${suffixes.at(-1)}`;
};

const formatTimestamp = timestamp => (new Date(timestamp * 1000)).toLocaleString();


const ManagerFilesContent = () => {
    const history = useHistory();

    const dropBoxService = useSelector(state => state.services.dropBoxService);
    const tree = useSelector(state => state.dropBox.tree);
    const treeLoading = useSelector(state => state.dropBox.isFetching);
    const workflows = useSelector(state => workflowsStateToPropsMixin(state).workflows);

    const filesByPath = useMemo(() => Object.fromEntries(
        recursivelyFlattenFileTree([], tree).map(f => [f.filePath, f])), [tree]);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loadingFileContents, setLoadingFileContents] = useState(false);
    const [fileContents, setFileContents] = useState({});

    const [fileInfoModal, setFileInfoModal] = useState(false);
    const [fileContentsModal, setFileContentsModal] = useState(false);

    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [tableSelectionModal, setTableSelectionModal] = useState(false);

    const handleSelect = useCallback(keys => {
        setSelectedFiles(keys.filter(k => k !== "root"));
    }, []);

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
        let filesLeft = [...selectedFiles];
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

            inputs[i.id] = isFileArray ? filesToTake : filesToTake[0];
            filesLeft = filesLeft.filter(f => !filesToTake.includes(f));
        }

        if (filesLeft.length > 0) {
            // If there are unclaimed files remaining at the end, the workflow is not compatible with the
            // total selection of files.
            workflowSupported = false;
        }

        return [workflowSupported, inputs];
    }, [selectedFiles]);

    const ingestIntoTable = useCallback(tableKey => {
        history.push(withBasePath("admin/data/manager/ingestion"), {
            step: STEP_INPUT,
            selectedTable: tableKey,
            selectedWorkflow,
            initialInputValues: getWorkflowFit(selectedWorkflow)[1]
        });
    }, [history, selectedWorkflow]);

    const handleViewFile = useCallback(() => {
        (async () => {
            if (selectedFiles.length !== 1) return;
            const file = selectedFiles[0];
            if (fileContents.hasOwnProperty(file)) {
                showFileContentsModal();
                return;
            }

            const urisByFilePath = generateURIsByFilePath(tree, {});
            if (!(file in urisByFilePath)) {
                console.error(`Files: something went wrong while trying to load ${file}`);
                return;
            }

            try {
                setLoadingFileContents(true);
                const r = await fetch(urisByFilePath[file]);
                setFileContents({
                    ...fileContents,
                    [file]: r.ok ? await r.text() : resourceLoadError(file),
                });
            } catch (e) {
                console.error(e);
                setFileContents({
                    ...fileContents,
                    [file]: resourceLoadError(file),
                });
            } finally {
                setLoadingFileContents(false);
            }

            showFileContentsModal();
        })();
    }, [selectedFiles, fileContents]);

    const workflowsSupported = [];
    const workflowMenu = (
        <Menu>
            {workflows.map(w => {
                const workflowSupported = getWorkflowFit(w)[0];
                if (workflowSupported) workflowsSupported.push(w);
                return (
                    <Menu.Item key={w.id}
                               disabled={!workflowSupported}
                               onClick={() => showTableSelectionModal(w)}>
                        Ingest with Workflow &ldquo;{w.name}&rdquo;
                    </Menu.Item>
                );
            })}
        </Menu>
    );

    const selectedFileViewable = selectedFiles.length === 1 &&
        Object.keys(LANGUAGE_HIGHLIGHTERS).filter(e => selectedFiles[0].endsWith(e)).length > 0;

    const selectedFileInfoAvailable = selectedFiles.length === 1 && selectedFiles[0] in filesByPath;

    const viewableFile = selectedFileViewable ? selectedFiles[0] : "";
    const viewableFileType = viewableFile.split(".").slice(-1)[0];

    const fileForInfo = selectedFileInfoAvailable ? selectedFiles[0] : "";

    const InfoDownloadButton = ({disabled}) => (
        <Button key="download" icon="download" disabled={disabled} onClick={() => {
            const uri = filesByPath[fileForInfo]?.uri;
            if (uri) {
                window.open(uri, "_blank");
            }
        }}>Download</Button>
    );
    InfoDownloadButton.propTypes = {
        disabled: PropTypes.bool,
    };

    return <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <TableSelectionModal
                dataType={selectedWorkflow?.data_type || null}
                visible={tableSelectionModal}
                title={"Select a Table to Ingest Into"}
                onCancel={hideTableSelectionModal}
                onOk={tableKey => ingestIntoTable(tableKey)}
            />

            <Modal visible={fileContentsModal}
                   title={`${viewableFile.split("/").at(-1)} - contents`}
                   width={960}
                   footer={null}
                   onCancel={hideFileContentsModal}>
                <Spin spinning={loadingFileContents}>
                    {viewableFileType === "json" ? (
                        <ReactJson
                            src={JSON.parse(fileContents[viewableFile] || "{}")}
                            displayDataTypes={false}
                            enableClipboard={false}
                            name={null}
                            collapsed={true}
                        />
                    ) : (
                        <SyntaxHighlighter
                            language={LANGUAGE_HIGHLIGHTERS[`.${viewableFileType}`]}
                            style={a11yLight}
                            customStyle={{fontSize: "12px"}}
                            showLineNumbers={true}
                        >
                            {fileContents[viewableFile] || ""}
                        </SyntaxHighlighter>
                    )}
                </Spin>
            </Modal>

            <Modal visible={fileInfoModal}
                   title={`${fileForInfo.split("/").at(-1)} - information`}
                   width={960}
                   footer={[<InfoDownloadButton key="download" />]}
                   onCancel={hideFileInfoModal}>
                <Descriptions bordered={true}>
                    <Descriptions.Item label="Name" span={3}>
                        {fileForInfo.split("/").at(-1)}</Descriptions.Item>
                    <Descriptions.Item label="Path" span={3}>{fileForInfo}</Descriptions.Item>
                    <Descriptions.Item label="Size" span={3}>
                        {formatSize(filesByPath[fileForInfo]?.size ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Last Modified" span={3}>
                        {formatTimestamp(filesByPath[fileForInfo]?.lastModified ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Last Metadata Change" span={3}>
                        {formatTimestamp(filesByPath[fileForInfo]?.lastMetadataChange ?? 0)}
                    </Descriptions.Item>
                </Descriptions>
            </Modal>

            <div style={{display: "flex", flexDirection: "column", gap: "1em"}}>
                <div style={{display: "flex", gap: "12px"}}>
                    <Dropdown.Button overlay={workflowMenu}
                                     disabled={!dropBoxService
                                         || selectedFiles.length === 0
                                         || workflowsSupported.length === 0}
                                     onClick={() => {
                                         if (workflowsSupported.length !== 1) return;
                                         showTableSelectionModal(workflowsSupported[0]);
                                     }}>
                        <Icon type="import" /> Ingest
                    </Dropdown.Button>
                    <Button icon="info-circle" onClick={showFileInfoModal} disabled={!selectedFileInfoAvailable}>
                        File Info
                    </Button>
                    <Button icon="file-text" onClick={handleViewFile} disabled={!selectedFileViewable}
                            loading={loadingFileContents}>
                        View
                    </Button>
                    <InfoDownloadButton disabled={!selectedFileInfoAvailable} />
                    {/* TODO: Implement v0.2 */}
                    {/*<Button type="danger" icon="delete" disabled={this.state.selectedFiles.length === 0}>*/}
                    {/*    Delete*/}
                    {/*</Button>*/}
                    {/* TODO: Implement v0.2 */}
                    {/*<Button type="primary" icon="upload" style={{float: "right"}}>Upload</Button>*/}
                </div>

                <Spin spinning={treeLoading}>
                    {(treeLoading || dropBoxService) ? (
                        <Tree.DirectoryTree defaultExpandAll={true}
                                            multiple={true}
                                            onSelect={keys => handleSelect(keys)}
                                            selectedKeys={selectedFiles}>
                            <Tree.TreeNode title="Drop Box" key="root">
                                {generateFileTree(tree)}
                            </Tree.TreeNode>
                        </Tree.DirectoryTree>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                               description="Encountered an error while trying to access the drop box service" />}
                </Spin>

                <Statistic
                    title="Total Space Used"
                    value={treeLoading
                        ? "—"
                        : formatSize(Object.values(filesByPath).reduce((acc, f) => acc + f.size, 0))}
                />
            </div>
        </Layout.Content>
    </Layout>;
};

export default ManagerFilesContent;
