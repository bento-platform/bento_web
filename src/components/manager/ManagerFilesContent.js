import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import fetch from "cross-fetch";

import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {a11yLight} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import {json, markdown, plaintext} from "react-syntax-highlighter/dist/cjs/languages/hljs";

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

import {Button, Dropdown, Empty, Icon, Layout, Menu, Modal, Spin, Tree} from "antd";



import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import TableSelectionModal from "./TableSelectionModal";

import {STEP_INPUT} from "./ingestion";
import {withBasePath} from "../../utils/url";
import {
    dropBoxTreeStateToPropsMixin,
    dropBoxTreeStateToPropsMixinPropTypes,
    workflowsStateToPropsMixin,
    workflowsStateToPropsMixinPropTypes
} from "../../propTypes";
import { WORKFLOW_ACTION } from "../../constants";


const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = directory => [...directory].sort(sortByName).map(entry =>
    <Tree.TreeNode title={entry.name} key={entry.path} isLeaf={!entry.hasOwnProperty("contents")}>
        {(entry || {contents: []}).contents ? generateFileTree(entry.contents) : null}
    </Tree.TreeNode>);

const resourceLoadError = resource => `An error was encountered while loading ${resource}`;


class ManagerFilesContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: [],
            loadingFileContents: false,
            fileContents: {},
            fileContentsModal: false,

            selectedWorkflow: null,
            tableSelectionModal: false,
        };

        this.handleSelect = this.handleSelect.bind(this);
        this.showFileContentsModal = this.showFileContentsModal.bind(this);
        this.hideFileContentsModal = this.hideFileContentsModal.bind(this);
        this.hideTableSelectionModal = this.hideTableSelectionModal.bind(this);
        this.ingestIntoTable = this.ingestIntoTable.bind(this);
        this.handleViewFile = this.handleViewFile.bind(this);
    }

    handleSelect(keys) {
        this.setState({selectedFiles: keys.filter(k => k !== "root")});
    }

    showFileContentsModal() {
        this.setState({fileContentsModal: true});
    }

    hideFileContentsModal() {
        this.setState({fileContentsModal: false});
    }

    showTableSelectionModal(workflow) {
        this.setState({
            selectedWorkflow: workflow,
            tableSelectionModal: true,
        });
    }

    hideTableSelectionModal() {
        this.setState({tableSelectionModal: false});
    }

    ingestIntoTable(tableKey) {
        this.props.history.push(withBasePath("admin/data/manager/ingestion"), {
            step: STEP_INPUT,
            selectedTable: tableKey,
            selectedWorkflow: this.state.selectedWorkflow,
            initialInputValues: this.getWorkflowFit(this.state.selectedWorkflow)[1]
        });
    }

    async handleViewFile() {  // TODO: Action-ify?
        if (this.state.selectedFiles.length !== 1) return;
        const file = this.state.selectedFiles[0];
        if (this.state.fileContents.hasOwnProperty(file)) {
            this.showFileContentsModal();
            return;
        }

        try {
            this.setState({loadingFileContents: true});

            // TODO: Proper url stuff
            // TODO: Don't hard-code replace
            const r = await fetch(`${this.props.dropBoxService.url}/objects${
                file.replace("/chord/data/drop-box", "")}`);

            this.setState({
                loadingFileContents: false,
                fileContents: {
                    ...this.state.fileContents,
                    [file]: r.ok ? await r.text() : resourceLoadError(file)
                }
            });
        } catch (e) {
            console.error(e);
            this.setState({
                loadingFileContents: false,
                fileContents: {
                    ...this.state.fileContents,
                    [file]: resourceLoadError(file)
                }
            });
        }

        this.showFileContentsModal();
    }

    getWorkflowFit(w) {
        let workflowSupported = true;
        let filesLeft = [...this.state.selectedFiles];
        const inputs = {};

        for (const i of w.inputs.filter(i => i.type.startsWith("file"))) {
            // Find tables that support the data type
            // TODO

            // Find files where 1+ of the valid extensions (e.g. jpeg or jpg) match.
            const compatibleFiles = filesLeft.filter(f => !!i.extensions.find(e => f.endsWith(e)));
            if (compatibleFiles.length === 0) {
                workflowSupported = false;
                break;
            }

            // Steal the first compatible file, or all if it's an array
            const filesToTake = filesLeft.filter(f => i.type.endsWith("[]")
                ? compatibleFiles.includes(f)
                : f === compatibleFiles[0]);

            inputs[i.id] = filesToTake;
            filesLeft = filesLeft.filter(f => !filesToTake.includes(f));
        }

        if (filesLeft.length > 0) {
            // If there are unclaimed files remaining at the end, the workflow is not compatible with the
            // total selection of files.
            workflowSupported = false;
        }

        return [workflowSupported, inputs];
    }

    render() {
        // TODO: Loading for workflows...
        // TODO: Proper workflow keys

        const workflowsSupported = [];
        const workflowMenu = (
            <Menu>
                {this.props.workflows
                    .filter(w => w.action === WORKFLOW_ACTION.INGESTION)
                    .map(w => {
                        const workflowSupported = this.getWorkflowFit(w)[0];
                        if (workflowSupported) workflowsSupported.push(w);
                        return (
                            <Menu.Item key={w.id}
                                    disabled={!workflowSupported}
                                    onClick={() => this.showTableSelectionModal(w)}>
                                Ingest with Workflow &ldquo;{w.name}&rdquo;
                            </Menu.Item>
                        );
                    })
                }
            </Menu>
        );

        const selectedFileViewable = this.state.selectedFiles.length === 1 &&
            Object.keys(LANGUAGE_HIGHLIGHTERS).filter(e => this.state.selectedFiles[0].endsWith(e)).length > 0;

        const selectedFile = selectedFileViewable ? this.state.selectedFiles[0] : "";
        const selectedFileType = selectedFile.split(".").slice(-1)[0];

        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <TableSelectionModal
                    dataType={(this.state.selectedWorkflow || {}).data_type || null}
                    visible={this.state.tableSelectionModal}
                    title={"Select a Table to Ingest Into"}
                    onCancel={() => this.hideTableSelectionModal()}
                    onOk={tableKey => this.ingestIntoTable(tableKey)}
                />
                {/* TODO: v0.2: Don't hard-code replace */}
                <Modal visible={this.state.fileContentsModal}
                       title={selectedFile.replace("/chord/data/drop-box", "")}
                       width={800}
                       footer={null}
                       onCancel={this.hideFileContentsModal}>
                    <Spin spinning={this.state.loadingFileContents}>
                        <SyntaxHighlighter language={LANGUAGE_HIGHLIGHTERS[`.${selectedFileType}`]}
                                           style={a11yLight}
                                           customStyle={{fontSize: "12px"}}
                                           showLineNumbers={true}>
                            {this.state.fileContents[selectedFile] || ""}
                        </SyntaxHighlighter>
                    </Spin>
                </Modal>
                <div style={{marginBottom: "1em"}}>
                    <Dropdown.Button overlay={workflowMenu} style={{marginRight: "12px"}}
                                     disabled={!this.props.dropBoxService
                                        || this.state.selectedFiles.length === 0
                                        || workflowsSupported.length === 0}
                                     onClick={() => {
                                         if (workflowsSupported.length !== 1) return;
                                         this.showTableSelectionModal(workflowsSupported[0]);
                                     }}>
                        <Icon type="import" /> Ingest
                    </Dropdown.Button>
                    <Button icon="file-text"
                            onClick={() => this.handleViewFile()}
                            style={{marginRight: "12px"}}
                            disabled={!selectedFileViewable}
                            loading={this.state.loadingFileContents}>View</Button>
                    {/* TODO: Implement v0.2 */}
                    {/*<Button type="danger" icon="delete" disabled={this.state.selectedFiles.length === 0}>*/}
                    {/*    Delete*/}
                    {/*</Button>*/}
                    {/* TODO: Implement v0.2 */}
                    {/*<Button type="primary" icon="upload" style={{float: "right"}}>Upload</Button>*/}
                </div>
                <Spin spinning={this.props.treeLoading}>
                    {(this.props.treeLoading || this.props.dropBoxService) ? (
                        <Tree.DirectoryTree defaultExpandAll={true}
                                            multiple={true}
                                            onSelect={keys => this.handleSelect(keys)}
                                            selectedKeys={this.state.selectedFiles}>
                            <Tree.TreeNode title="chord_drop_box" key="root">
                                {generateFileTree(this.props.tree)}
                            </Tree.TreeNode>
                        </Tree.DirectoryTree>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                               description="Encountered an error while trying to access the drop box service" />}
                </Spin>
            </Layout.Content>
        </Layout>;
    }
}

ManagerFilesContent.propTypes = {
    dropBoxService: PropTypes.object,
    ...dropBoxTreeStateToPropsMixinPropTypes,
    ...workflowsStateToPropsMixinPropTypes
};

const mapStateToProps = state => ({
    dropBoxService: state.services.dropBoxService,
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state)
});

export default withRouter(connect(mapStateToProps)(ManagerFilesContent));
