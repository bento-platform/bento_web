import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Icon,
    Modal,
    Row,
    Typography,
} from "antd";

import DataUseDisplay from "../DataUseDisplay";

import {
    deleteProjectDatasetIfPossible,
    deleteDatasetLinkedFieldSetIfPossible,
} from "../../modules/metadata/actions";

import { INITIAL_DATA_USE_VALUE } from "../../duo";
import { simpleDeepCopy, nop } from "../../utils/misc";
import LinkedFieldSetTable from "./linked_field_set/LinkedFieldSetTable";
import LinkedFieldSetModal from "./linked_field_set/LinkedFieldSetModal";
import DatasetOverview from "./DatasetOverview";
import DatasetTables from "./DatasetTables";
import { FORM_MODE_ADD, FORM_MODE_EDIT } from "../../constants";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";

const DATASET_CARD_TABS = [
    { key: "overview", tab: "Overview" },
    { key: "tables", tab: "Data Tables" },
    { key: "linked_field_sets", tab: "Linked Field Sets" },
    { key: "data_use", tab: "Consent Codes and Data Use" },
];

const Dataset = ({
    value,
    mode,
    project,
    isFetchingTables,
    onEdit,
    onTableIngest,
    deleteProjectDataset,
    deleteLinkedFieldSet,
}) => {
    value = value || {};

    const [state, setState] = useState({
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
    });

    useEffect(() => {
        setState({ ...state, ...(value || {}) });
    }, [value]);

    const handleFieldSetDeletion = (fieldSet, index) => {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${fieldSet.name}" linked field set?`,
            content: (
                <>
                    <Typography.Paragraph>
                        Doing so will mean users will <strong>no longer</strong>{" "}
                        be able to link search results across the data types
                        specified via the following linked fields:
                    </Typography.Paragraph>
                    <LinkedFieldSetTable
                        linkedFieldSet={fieldSet}
                        inModal={true}
                    />
                </>
            ),
            width: 720,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({ okButtonProps: { loading: true } });
                await deleteLinkedFieldSet(state, fieldSet, index);
                deleteModal.update({ okButtonProps: { loading: false } });
            },
        });
    };

    const isPrivate = mode === "private";

    const tabContents = {
        overview: (
            <DatasetOverview
                dataset={state}
                project={project}
                isPrivate={isPrivate}
                isFetchingTables={isFetchingTables}
            />
        ),
        tables: (
            <DatasetTables
                dataset={state}
                project={project}
                isPrivate={isPrivate}
                isFetchingTables={isFetchingTables}
                onTableIngest={onTableIngest || nop}
            />
        ),
        linked_field_sets: (
            <>
                <Typography.Title level={4}>
                    Linked Field Sets
                    {isPrivate ? (
                        <div style={{ float: "right" }}>
                            <Button
                                icon="plus"
                                style={{ verticalAlign: "top" }}
                                type="primary"
                                onClick={() =>
                                    setState({
                                        ...state,
                                        fieldSetAdditionModalVisible: true,
                                    })
                                }
                            >
                                Add Linked Field Set
                            </Button>
                        </div>
                    ) : null}
                </Typography.Title>
                <Typography.Paragraph style={{ maxWidth: "600px" }}>
                    Linked Field Sets group common fields (i.e. fields that
                    share the same &ldquo;value space&rdquo;) between multiple
                    data types. For example, these sets can be used to tell the
                    discovery system that Phenopacket biosample identifiers are
                    the same as variant call sample identifiers, and so variant
                    calls with an identifier of &ldquo;sample1&rdquo; come from
                    a biosample with identifier &ldquo;sample1&rdquo;.
                </Typography.Paragraph>
                <Typography.Paragraph style={{ maxWidth: "600px" }}>
                    A word of caution: the more fields added to a Linked Field
                    Set, the longer it takes to search the dataset in question.
                </Typography.Paragraph>
                {(state.linked_field_sets || {}).length === 0 ? (
                    <>
                        <Divider />
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No Field Link Sets"
                        >
                            {isPrivate ? (
                                <Button
                                    icon="plus"
                                    type="primary"
                                    onClick={() =>
                                        setState({
                                            ...state,
                                            fieldSetAdditionModalVisible: true,
                                        })
                                    }
                                >
                                    Add Field Link Set
                                </Button>
                            ) : null}
                        </Empty>
                    </>
                ) : (
                    <Row gutter={[16, 24]}>
                        {(state.linked_field_sets || []).map((fieldSet, i) => (
                            <Col key={i} lg={24} xl={12}>
                                <Card
                                    title={`${i + 1}. ${fieldSet.name}`}
                                    actions={
                                        isPrivate
                                            ? [
                                                  <span
                                                      key="edit"
                                                      onClick={() =>
                                                          setState({
                                                              ...state,
                                                              fieldSetEditModalVisible: true,
                                                              selectedLinkedFieldSet:
                                                                  {
                                                                      data: fieldSet,
                                                                      index: i,
                                                                  },
                                                          })
                                                      }
                                                  >
                                                      <Icon
                                                          type="edit"
                                                          style={{
                                                              width: "auto",
                                                              display: "inline",
                                                          }}
                                                          key="edit_field_sets"
                                                      />{" "}
                                                      Manage Fields
                                                  </span>,
                                                  <span
                                                      key="delete"
                                                      onClick={() =>
                                                          handleFieldSetDeletion(
                                                              fieldSet,
                                                              i
                                                          )
                                                      }
                                                  >
                                                      <Icon
                                                          type="delete"
                                                          style={{
                                                              width: "auto",
                                                              display: "inline",
                                                          }}
                                                          key="delete_field_set"
                                                      />{" "}
                                                      Delete Set
                                                  </span>,
                                            ]
                                            : []
                                    }
                                >
                                    <LinkedFieldSetTable
                                        linkedFieldSet={fieldSet}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </>
        ),
        data_use: <DataUseDisplay dataUse={state.data_use} />,
    };

    const handleDelete = () => {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${state.title}" dataset?`,
            content: (
                <>
                    <Typography.Paragraph>
                        All data contained in the dataset will be deleted
                        permanently, and the dataset will no longer be available
                        for discovery within the CHORD federation.
                        {/* TODO: Real terms and conditions */}
                    </Typography.Paragraph>
                </>
            ),
            width: 572,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({ okButtonProps: { loading: true } });
                await deleteProjectDataset(state);
                deleteModal.update({ okButtonProps: { loading: false } });
            },
        });
    };

    return (
        <Card
            key={state.identifier}
            title={state.title}
            tabList={DATASET_CARD_TABS}
            activeTabKey={state.selectedTab}
            onTabChange={(t) => setState({ ...state, selectedTab: t })}
            extra={
                isPrivate ? (
                    <>
                        <Button
                            icon="edit"
                            style={{ marginRight: "8px" }}
                            onClick={() => (onEdit || nop)()}
                        >
                            Edit
                        </Button>
                        <Button
                            type="danger"
                            icon="delete"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                        {/* TODO: Share button (vFuture) */}
                    </>
                ) : null
            }
        >
            {isPrivate ? (
                <>
                    <LinkedFieldSetModal
                        mode={FORM_MODE_ADD}
                        dataset={state}
                        visible={state.fieldSetAdditionModalVisible}
                        onSubmit={() =>
                            setState({
                                ...state,
                                fieldSetAdditionModalVisible: false,
                            })
                        }
                        onCancel={() =>
                            setState({
                                ...state,
                                fieldSetAdditionModalVisible: false,
                            })
                        }
                    />

                    <LinkedFieldSetModal
                        mode={FORM_MODE_EDIT}
                        dataset={state}
                        visible={state.fieldSetEditModalVisible}
                        linkedFieldSet={state.selectedLinkedFieldSet.data}
                        linkedFieldSetIndex={state.selectedLinkedFieldSet.index}
                        onSubmit={() =>
                            setState({
                                ...state,
                                fieldSetEditModalVisible: false,
                            })
                        }
                        onCancel={() =>
                            setState({
                                ...state,
                                fieldSetEditModalVisible: false,
                            })
                        }
                    />
                </>
            ) : null}
            {tabContents[state.selectedTab]}
        </Card>
    );
};

Dataset.propTypes = {
    // Is the dataset being viewed in the context of the data manager or via discovery?
    mode: PropTypes.oneOf(["public", "private"]),

    project: projectPropTypesShape,

    value: datasetPropTypesShape,

    isFetchingTables: PropTypes.bool,

    onEdit: PropTypes.func,
    onTableIngest: PropTypes.func,

    deleteProjectDataset: PropTypes.func,
    deleteLinkedFieldSet: PropTypes.func,
};

const mapStateToProps = (state) => ({
    isFetchingTables:
        state.services.isFetchingAll ||
        state.projectTables.isFetching ||
        state.projects.isFetchingWithTables, // TODO: Hiccup
    isSavingDataset: state.projects.isSavingDataset,
    isDeletingDataset: state.projects.isDeletingDataset,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    deleteProjectDataset: (dataset) =>
        dispatch(deleteProjectDatasetIfPossible(ownProps.project, dataset)),
    deleteLinkedFieldSet: (dataset, linkedFieldSet, linkedFieldSetIndex) =>
        dispatch(
            deleteDatasetLinkedFieldSetIfPossible(
                dataset,
                linkedFieldSet,
                linkedFieldSetIndex
            )
        ),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dataset);
