import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Col, Divider, Empty, Icon, Modal, Row, Typography} from "antd";

import DataUseDisplay from "../DataUseDisplay";

import {
    addDatasetLinkedFieldSetIfPossible,
    deleteProjectDatasetIfPossible,
    deleteDatasetLinkedFieldSetIfPossible,
} from "../../modules/metadata/actions";

import {INITIAL_DATA_USE_VALUE} from "../../duo";
import {simpleDeepCopy, nop} from "../../utils/misc";
import LinkedFieldSetTable from "./linked_field_set/LinkedFieldSetTable";
import LinkedFieldSetModal from "./linked_field_set/LinkedFieldSetModal";
import DatasetOverview from "./DatasetOverview";
import {FORM_MODE_ADD, FORM_MODE_EDIT} from "../../constants";
import {datasetPropTypesShape, projectPropTypesShape} from "../../propTypes";
import DatasetDataTypes from "./DatasetDataTypes";


const DATASET_CARD_TABS = [
    {key: "overview", tab: "Overview"},
    {key: "data_types", tab: "Data Types"},
    {key: "linked_field_sets", tab: "Linked Field Sets"},
    {key: "data_use", tab: "Consent Codes and Data Use"},
];


const DEFAULT_BIOSAMPLE_LFS = {
    name: "BIO_SAMPLE_LFS",
    fields: {
        variant: [
            "calls",
            "[item]",
            "sample_id",
        ],
        experiment: [
            "biosample",
        ],
        phenopacket: [
            "biosamples",
            "[item]",
            "id",
        ],
    },
};


class Dataset extends Component {
    // TODO: Editing

    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {...(nextProps.value || {})};  // TODO: For editing
        }
        return null;
    }

    constructor(props) {
        super(props);

        const value = props.value || {};
        this.state = {  // TODO: For editing
            identifier: value.identifier || null,
            title: value.title || "",
            description: value.description || "",
            contact_info: value.contact_info || "",
            data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE),
            linked_field_sets: value.linked_field_sets || [],
            tables: value.tables || [],

            fieldSetAdditionModalVisible: false,

            fieldSetEditModalVisible: false,
            selectedLinkedFieldSet: {
                data: null,
                index: null,
            },

            selectedTab: "overview",
            selectedTable: null,
        };

        this.handleFieldSetDeletion = this.handleFieldSetDeletion.bind(this);
    }


    handleFieldSetDeletion(fieldSet, index) {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${fieldSet.name}" linked field set?`,
            content: <>
                <Typography.Paragraph>
                    Doing so will mean users will <strong>no longer</strong> be able to link
                    search results across the data types specified via the following
                    linked fields:
                </Typography.Paragraph>
                <LinkedFieldSetTable linkedFieldSet={fieldSet} inModal={true} />
            </>,
            width: 720,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({okButtonProps: {loading: true}});
                await this.props.deleteLinkedFieldSet(this.state, fieldSet, index);
                deleteModal.update({okButtonProps: {loading: false}});
            },
        });
    }

    render() {
        const {identifier, title, selectedTab} = this.state;

        const isPrivate = this.props.mode === "private";

        const defaultBiosampleLFSDisabled = this.state.linked_field_sets.length !== 0;

        const tabContents = {
            overview: <DatasetOverview dataset={this.state}
                                       project={this.props.project}
                                       isPrivate={isPrivate}
                                       isFetchingTables={this.props.isFetchingTables} />,
            // tables: <DatasetTables dataset={this.state}
            //                        project={this.props.project}
            //                        isPrivate={isPrivate}
            //                        isFetchingTables={this.props.isFetchingTables}
            //                        onTableIngest={this.props.onTableIngest || nop} />,
            data_types: <DatasetDataTypes dataset={this.state} 
                                          project={this.props.project} 
                                          isPrivate={isPrivate}
                                          isFetchingDatasets={this.props.isFetchingDatasets} 
                                          onIngest={this.props.onTableIngest}/>,
            linked_field_sets: (
                <>
                    <Typography.Title level={4}>
                        Linked Field Sets
                        {isPrivate ? (
                            <div style={{float: "right", display: "flex", flexDirection: "column", gap: "10px"}}>
                                <Button icon="plus"
                                        style={{verticalAlign: "top"}}
                                        type="primary"
                                        onClick={() => this.setState({fieldSetAdditionModalVisible: true})}>
                                    Add Linked Field Set
                                </Button>
                                <Button icon="plus"
                                        style={{verticalAlign: "top"}}
                                        type="default"
                                        disabled={defaultBiosampleLFSDisabled}
                                        onClick={() => this.props.addLinkedFieldSet(this.state, DEFAULT_BIOSAMPLE_LFS)}>
                                    Default Biosample Field Set
                                </Button>
                            </div>
                        ) : null}
                    </Typography.Title>
                    <Typography.Paragraph style={{maxWidth: "600px"}}>
                        Linked Field Sets group common fields (i.e. fields that share the same &ldquo;value
                        space&rdquo;) between multiple data types. For example, these sets can be used to tell the
                        data exploration system that Phenopacket biosample identifiers are the same as variant call
                        sample identifiers, and so variant calls with an identifier of &ldquo;sample1&rdquo; come from a
                        biosample with identifier &ldquo;sample1&rdquo;.
                    </Typography.Paragraph>
                    <Typography.Paragraph style={{maxWidth: "600px"}}>
                        A word of caution: the more fields added to a Linked Field Set, the longer it takes to search
                        the dataset in question.
                    </Typography.Paragraph>
                    {(this.state.linked_field_sets || {}).length === 0
                        ? (
                            <>
                                <Divider />
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Field Link Sets">
                                    {isPrivate ? (
                                        <Button icon="plus"
                                                type="primary"
                                                onClick={() =>
                                                    this.setState({fieldSetAdditionModalVisible: true})}>
                                            Add Field Link Set
                                        </Button>
                                    ) : null}
                                </Empty>
                            </>
                        ) : (
                            <Row gutter={[16, 24]}>
                                {(this.state.linked_field_sets || []).map((fieldSet, i) => (
                                    <Col key={i} lg={24} xl={12}>
                                        <Card title={`${i + 1}. ${fieldSet.name}`} actions={isPrivate ? [
                                            <span key="edit" onClick={() => this.setState({
                                                fieldSetEditModalVisible: true,
                                                selectedLinkedFieldSet: {
                                                    data: fieldSet,
                                                    index: i,
                                                },
                                            })}>
                                                <Icon type="edit"
                                                      style={{width: "auto", display: "inline"}}
                                                      key="edit_field_sets" /> Manage Fields</span>,
                                            <span key="delete" onClick={() => this.handleFieldSetDeletion(fieldSet, i)}>
                                                <Icon type="delete"
                                                      style={{width: "auto", display: "inline"}}
                                                      key="delete_field_set" /> Delete Set</span>,
                                        ] : []}>
                                            <LinkedFieldSetTable linkedFieldSet={fieldSet} />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                </>
            ),
            data_use: <DataUseDisplay dataUse={this.state.data_use} />,
        };

        const handleDelete = () => {
            const deleteModal = Modal.confirm({
                title: `Are you sure you want to delete the "${this.state.title}" dataset?`,
                content: <>
                    <Typography.Paragraph>
                        All data contained in the dataset will be deleted permanently, and the
                        dataset will no longer be available for exploration.
                    </Typography.Paragraph>
                </>,
                width: 572,
                autoFocusButton: "cancel",
                okText: "Delete",
                okType: "danger",
                maskClosable: true,
                onOk: async () => {
                    deleteModal.update({okButtonProps: {loading: true}});
                    await this.props.deleteProjectDataset(this.state);
                    deleteModal.update({okButtonProps: {loading: false}});
                },
            });
        };

        return (
            <Card
                key={identifier}
                title={<span>{title} <span style={{
                    fontStyle: "italic",
                    fontWeight: "normal",
                    fontSize: "0.8em",
                    fontFamily: "monospace",
                    marginLeft: "0.8em",
                    color: "#8c8c8c",  // Ant Design gray-7
                }}>{identifier}</span></span>}
                tabList={DATASET_CARD_TABS}
                activeTabKey={selectedTab}
                onTabChange={t => this.setState({selectedTab: t})}
                extra={
                    isPrivate ? <>
                        <Button icon="edit"
                                style={{marginRight: "8px"}}
                                onClick={() => (this.props.onEdit || nop)()}>Edit</Button>
                        <Button type="danger" icon="delete" onClick={handleDelete}>Delete</Button>
                        {/* TODO: Share button (vFuture) */}
                    </> : null
                }
            >
                {isPrivate ? <>
                    <LinkedFieldSetModal mode={FORM_MODE_ADD}
                                         dataset={this.state}
                                         visible={this.state.fieldSetAdditionModalVisible}
                                         onSubmit={() => this.setState({fieldSetAdditionModalVisible: false})}
                                         onCancel={() => this.setState({fieldSetAdditionModalVisible: false})} />

                    <LinkedFieldSetModal mode={FORM_MODE_EDIT}
                                         dataset={this.state}
                                         visible={this.state.fieldSetEditModalVisible}
                                         linkedFieldSet={this.state.selectedLinkedFieldSet.data}
                                         linkedFieldSetIndex={this.state.selectedLinkedFieldSet.index}
                                         onSubmit={() => this.setState({fieldSetEditModalVisible: false})}
                                         onCancel={() => this.setState({fieldSetEditModalVisible: false})} />
                </> : null}
                {tabContents[selectedTab]}
            </Card>
        );
    }
}

Dataset.propTypes = {
    // Is the dataset being viewed in the context of the data manager or via discovery?
    mode: PropTypes.oneOf(["public", "private"]),

    project: projectPropTypesShape,
    strayTables: PropTypes.arrayOf(PropTypes.object),

    value: datasetPropTypesShape,

    isFetchingTables: PropTypes.bool,

    onEdit: PropTypes.func,
    onTableIngest: PropTypes.func,

    addLinkedFieldSet: PropTypes.func,
    deleteProjectDataset: PropTypes.func,
    deleteLinkedFieldSet: PropTypes.func,
};

const mapStateToProps = state => ({
    isFetchingTables: state.services.isFetchingAll
        || state.projectTables.isFetching
        || state.projects.isFetchingWithTables,  // TODO: Hiccup
    isSavingDataset: state.projects.isSavingDataset,
    isDeletingDataset: state.projects.isDeletingDataset,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addLinkedFieldSet: (dataset, newLinkedFieldSet, onSuccess) =>
        dispatch(addDatasetLinkedFieldSetIfPossible(dataset, newLinkedFieldSet, onSuccess)),
    deleteProjectDataset: dataset => dispatch(deleteProjectDatasetIfPossible(ownProps.project, dataset)),
    deleteLinkedFieldSet: (dataset, linkedFieldSet, linkedFieldSetIndex) =>
        dispatch(deleteDatasetLinkedFieldSetIfPossible(dataset, linkedFieldSet, linkedFieldSetIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dataset);
