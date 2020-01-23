import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Col, Divider, Empty, Modal, Row, Spin, Statistic, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/col/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
import "antd/es/modal/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/statistic/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DataUseDisplay from "../../DataUseDisplay";
import TableAdditionModal from "./TableAdditionModal";
import TableDeletionModal from "./TableDeletionModal";

import {
    addProjectTable,
    deleteProjectTableIfPossible,
    fetchProjectsWithDatasetsAndTables
} from "../../../modules/metadata/actions";

import {INITIAL_DATA_USE_VALUE} from "../../../duo";
import {simpleDeepCopy, projectPropTypesShape, linkedFieldSetPropTypesShape} from "../../../utils";
import LinkedFieldSetTable from "./LinkedFieldSetTable";
import LinkedFieldSetAdditionModal from "./LinkedFieldSetAdditionModal";


const NA_TEXT = (<span style={{color: "#999", fontStyle: "italic"}}>N/A</span>);

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
            data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE),
            linked_field_sets: value.linked_field_sets || [],
            tables: value.tables || [],

            additionModalVisible: false,
            deletionModalVisible: false,
            fieldSetAdditionModalVisible: false,
            selectedTab: "overview",
            selectedTable: null,
        };

        this.handleAdditionClick = this.handleAdditionClick.bind(this);
        this.handleAdditionCancel = this.handleAdditionCancel.bind(this);
        this.handleAdditionSubmit = this.handleAdditionSubmit.bind(this);

        this.handleTableDeletionClick = this.handleTableDeletionClick.bind(this);
        this.handleTableDeletionCancel = this.handleTableDeletionCancel.bind(this);
        this.handleTableDeletionSubmit = this.handleTableDeletionSubmit.bind(this);

    }

    handleAdditionClick() {
        this.setState({additionModalVisible: true});
    }

    handleAdditionCancel() {
        this.setState({additionModalVisible: false});
    }

    async handleAdditionSubmit(values) {
        const [serviceArtifact, dataTypeID] = values.dataType.split(":");
        const serviceInfo = this.props.serviceInfoByArtifact[serviceArtifact];
        await this.props.addProjectTable(this.props.project, this.state.identifier, serviceInfo, dataTypeID,
            values.name);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({additionModalVisible: false});
    }

    handleTableDeletionClick(t) {
        this.setState({deletionModalVisible: true, selectedTable: t});
    }

    handleTableDeletionCancel() {
        this.setState({deletionModalVisible: false});
    }

    async handleTableDeletionSubmit() {
        if (this.state.selectedTable === null) return;
        await this.props.deleteProjectTable(this.props.project, this.state.selectedTable);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({deletionModalVisible: false});
    }

    render() {
        const tableListColumns = [
            {title: "ID", dataIndex: "table_id"},
            {
                title: "Name",
                dataIndex: "name",
                render: n => (n ? n : NA_TEXT),
                defaultSortOrder: "ascend",
                sorter: (a, b) => (a.name && b.name) ? a.name.localeCompare(b.name) : a.id.localeCompare(b.id)
            },
            {title: "Data Type", dataIndex: "data_type"},
            {
                title: "actions",
                key: "actions",
                width: 330,
                render: t => (
                    <Row gutter={10}>
                        <Col span={8}>
                            <Button icon="import"
                                    style={{width: "100%"}}
                                    onClick={() => (this.props.onTableIngest || (() => {}))(this.props.project, t)}>
                                Ingest
                            </Button>
                        </Col>
                        <Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>
                        <Col span={8}><Button type="danger"
                                              icon="delete"
                                              onClick={() => this.handleTableDeletionClick(t)}
                                              style={{width: "100%"}}>Delete</Button></Col>
                    </Row>
                )
            }
        ];

        const tabContents = {
            overview: (
                <>
                    {this.state.description.length > 0 ? (
                        <Typography.Paragraph>{this.state.description}</Typography.Paragraph>
                    ) : null}
                    <Row gutter={16} style={{maxWidth: "720px"}}>
                        <Col span={12}>
                            <Statistic title="Created"
                                       value={(new Date(Date.parse(this.state.created))).toLocaleString()} />
                        </Col>
                        <Col span={12}>
                            <Spin spinning={this.props.loadingTables}>
                                {/* Add 1 to represent metadata table TODO: Don't want to hard code */}
                                <Statistic title="Tables"
                                           value={this.props.loadingTables ? "—" : this.state.tables.length + 1} />
                            </Spin>
                        </Col>
                    </Row>
                </>
            ),
            individuals: (
                <>
                    <Typography.Title level={4}>Individuals and Pools</Typography.Title>
                    <Typography.Paragraph>
                        Individuals can potentially be shared across many datasets.
                    </Typography.Paragraph>

                    <Table bordered
                           style={{marginBottom: "1rem"}}
                           dataSource={this.props.individuals.map(i => ({
                               ...i,
                               sex: i.sex || "UNKNOWN_SEX",
                               n_of_biosamples: (i.biosamples || []).length
                           }))}
                           rowKey="id"
                           loading={this.props.loadingIndividuals}
                           columns={[
                               {title: "Individual ID", dataIndex: "id"},
                               {title: "Date of Birth", dataIndex: "date_of_birth"},
                               {title: "Sex", dataIndex: "sex"},
                               {title: "# Biosamples", dataIndex: "n_of_biosamples"}  // TODO: Only relevant biosamples
                           ]}
                           expandedRowRender={i => {
                               return <div>
                                   <Table columns={[{title: "Biosample ID", dataIndex: "id"}]}
                                          rowKey="id"
                                          dataSource={i.biosamples || []} />
                               </div>;
                           }}
                    />
                </>
            ),
            tables: (
                <>
                    <Typography.Title level={4}>
                        Tables
                        <div style={{float: "right"}}>
                            {/* TODO: Implement v0.2
                            {(this.props.strayTables || []).length > 0 ? (
                                <Button icon="import" style={{verticalAlign: "top", marginRight: "10px"}}>
                                    Adopt Stray Tables ({this.props.strayTables.length})
                                </Button>
                            ) : null} */}
                            <Button icon="plus"
                                    style={{verticalAlign: "top"}}
                                    type="primary"
                                    onClick={() => this.handleAdditionClick()}>
                                Add Table
                            </Button>
                        </div>
                    </Typography.Title>
                    <Table bordered
                           dataSource={this.state.tables.map(t => ({...t, name: t.name || null}))}
                           rowKey="table_id"
                           // expandedRowRender={() => (<span>TODO: List of files</span>)} TODO: Implement v0.2
                           columns={tableListColumns}
                           loading={this.props.loadingTables} />
                </>
            ),
            linked_field_sets: (
                <>
                    <Typography.Title level={4}>
                        Linked Field Sets
                        <div style={{float: "right"}}>
                            <Button icon="plus"
                                    style={{verticalAlign: "top"}}
                                    type="primary"
                                    onClick={() => this.setState({fieldSetAdditionModalVisible: true})}>
                                Add Field Link Set
                            </Button>
                        </div>
                    </Typography.Title>
                    <Typography.Paragraph style={{maxWidth: "600px"}}>
                        Linked Field Sets group common fields (i.e. fields that share the same "value space") between
                        multiple data types. For example, these sets can be used to tell the discovery system that
                        Phenopacket biosample identifiers are the same as variant sample identifiers, and so variants
                        with an identifier of "sample1" come from a biosample with identifier "sample1".
                    </Typography.Paragraph>
                    <Typography.Paragraph style={{maxWidth: "600px"}}>
                        A word of caution: the more fields added to a Linked Field Set, the longer it takes to 
                    </Typography.Paragraph>
                    {(this.state.linked_field_sets || {}).length === 0
                        ? (
                            <>
                                <Divider />
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Field Link Sets">
                                    <Button icon="plus"
                                            type="primary"
                                            onClick={() => this.setState({fieldSetAdditionModalVisible: true})}>
                                        Add Field Link Set
                                    </Button>
                                </Empty>
                            </>
                        ) : null}
                    {(this.state.linked_field_sets || []).map((fieldSet, i) => (
                        <Card key={i} title={fieldSet.name} extra={
                            <>
                                <Button icon="plus" style={{marginRight: "8px"}}>Add Field to Set</Button>
                                <Button icon="delete" type="danger" onClick={() => {
                                    Modal.confirm({
                                        title: `Are you sure you want to delete the "${fieldSet.name}" field link set?`,
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
                                        okButtonProps: {type: "danger"},
                                        maskClosable: true,
                                    })
                                }}>Delete</Button>
                            </>
                        }>
                            <LinkedFieldSetTable linkedFieldSet={fieldSet} />
                        </Card>
                    ))}
                </>
            ),
            data_use: <DataUseDisplay dataUse={this.state.data_use} />
        };

        return (
            <Card key={this.state.identifier} title={this.state.title} tabList={[
                {key: "overview", tab: "Overview"},
                {key: "individuals", tab: "Individuals and Pools"},
                {key: "tables", tab: "Data Tables"},
                {key: "linked_field_sets", tab: "Linked Field Sets"},
                {key: "data_use", tab: "Consent Codes and Data Use"},
            ]} activeTabKey={this.state.selectedTab} onTabChange={t => this.setState({selectedTab: t})} extra={<>
                <Button icon="import" style={{marginRight: "16px"}}
                        onClick={() => (this.props.onTableIngest || (() => {}))(this.props.project, {
                            // Map dataset to metadata table  TODO: Remove all these hacks
                            id: this.state.identifier,
                            data_type: "phenopacket",  // TODO: Remove hard-coding...
                        })}>
                    Ingest Metadata
                </Button>
                <Button icon="edit"
                        style={{marginRight: "8px"}}
                        onClick={() => (this.props.onEdit || (() => {}))()}>Edit</Button>
                <Button type="danger" icon="delete" onClick={() => {}}>Delete</Button>
                {/* TODO: Delete Dataset Button functionality (v0.1) */}
                {/* TODO: Share button */}
            </>}>
                <TableAdditionModal visible={this.state.additionModalVisible}
                                    project={this.props.project}
                                    dataset={this.state}
                                    onSubmit={vs => this.handleAdditionSubmit(vs)}
                                    onCancel={() => this.handleAdditionCancel()} />

                <TableDeletionModal visible={this.state.deletionModalVisible}
                                    table={this.state.selectedTable}
                                    onSubmit={() => this.handleTableDeletionSubmit()}
                                    onCancel={() => this.handleTableDeletionCancel()} />

                <LinkedFieldSetAdditionModal dataset={this.state}
                                             visible={this.state.fieldSetAdditionModalVisible}
                                             onSubmit={() => this.setState({fieldSetAdditionModalVisible: false})}
                                             onCancel={() =>
                                                 this.setState({fieldSetAdditionModalVisible: false})} />

                {tabContents[this.state.selectedTab]}
            </Card>
        );
    }
}

Dataset.propTypes = {
    project: projectPropTypesShape,
    strayTables: PropTypes.arrayOf(PropTypes.object),

    value: PropTypes.shape({
        identifier: PropTypes.string,
        title: PropTypes.string,
        linked_field_sets: PropTypes.arrayOf(linkedFieldSetPropTypesShape),
        tables: PropTypes.arrayOf(PropTypes.object),
    }),

    individuals: PropTypes.arrayOf(PropTypes.object),  // TODO: Get this via redux store instead of transformations

    loadingIndividuals: PropTypes.bool,
    loadingTables: PropTypes.bool,

    onEdit: PropTypes.func,
    onTableIngest: PropTypes.func,

    serviceInfoByArtifact: PropTypes.object
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact
});

const mapDispatchToProps = dispatch => ({
    addProjectTable: async (project, datasetID, serviceID, dataTypeID, tableName) =>
        await dispatch(addProjectTable(project, datasetID, serviceID, dataTypeID, tableName)),
    deleteProjectTable: async (project, table) => await dispatch(deleteProjectTableIfPossible(project, table)),
    fetchProjectsWithDatasetsAndTables: async () => dispatch(fetchProjectsWithDatasetsAndTables())
});

export default connect(mapStateToProps, mapDispatchToProps)(Dataset);
