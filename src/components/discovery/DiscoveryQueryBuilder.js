import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Dropdown, Empty, Icon, Menu, Modal, Tabs, Typography} from "antd";

import DataTypeExplorationModal from "./DataTypeExplorationModal";
import DiscoverySearchForm from "./DiscoverySearchForm";
import {nop} from "../../utils/misc";

import {OP_EQUALS} from "../../utils/search";
import {getFieldSchema} from "../../utils/schema";

import { neutralizeAutoQueryPageTransition } from "../../modules/explorer/actions";

class DiscoveryQueryBuilder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            schemasModalShown: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleSchemasToggle = this.handleSchemasToggle.bind(this);

        this.handleAddDataTypeQueryForm = this.handleAddDataTypeQueryForm.bind(this);
        this.handleTabsEdit = this.handleTabsEdit.bind(this);

        this.forms = {};

    }

    componentDidMount() {
        (this.props.requiredDataTypes || []).forEach(dt => this.props.addDataTypeQueryForm(dt));

        if ((this.props.autoQuery || {}).isAutoQuery) {

            // Trigger a cascade of async functions
            // that involve waiting for redux actions to reduce (complete)
            // before triggering others
            (async () => {

                // Clean old queries (if any)
                Object.values(this.props.dataTypesByID).forEach(value =>
                    this.handleTabsEdit(value.id, "remove"));

                // Set type of query
                await this.handleAddDataTypeQueryForm({key: `${this.props.autoQuery.autoQueryType}`});

                // Set term
                const dataType =this.props.dataTypesByID[this.props.autoQuery.autoQueryType];
                const fields = {
                    keys: {
                        value:[0]
                    },
                    conditions: [{
                        name: "conditions[0]",
                        value: {
                            dataType: dataType,
                            field: this.props.autoQuery.autoQueryField,
                            // from utils/schema:
                            fieldSchema: getFieldSchema(dataType.schema, this.props.autoQuery.autoQueryField),
                            negated: false,
                            operation: OP_EQUALS,
                            searchValue: this.props.autoQuery.autoQueryValue
                        },
                    }]
                };

                // "Simulate" form data structure and trigger update
                await this.handleFormChange(dataType, fields);

                // Simulate form submission click
                this.handleSubmit();

                // Clean up auto-query "paper trail" (that is, the state segment that
                // was introduced in order to transfer intent from the OverviewContent page)
                this.props.neutralizeAutoQueryPageTransition();
            })();
        }
    }

    async handleSubmit() {
        try {
            await Promise.all(Object.entries(this.forms).filter(f => f[1]).map(([_dt, f]) =>
                new Promise((resolve, reject) => {
                    f.props.form.validateFields({force: true}, err => {
                        if (err) {
                            // TODO: If error, switch to errored tab
                            reject(err);
                        }
                        resolve();  // TODO: data?
                    });
                })));

            (this.props.onSubmit || nop)();
        } catch (err) {
            console.error(err);
        }
    }

    handleFormChange(dataType, fields) {
        this.props.updateDataTypeQueryForm(dataType, fields);
    }

    handleSchemasToggle() {
        this.setState({schemasModalShown: !this.state.schemasModalShown});
    }

    handleAddDataTypeQueryForm(e) {
        var esplits=e.key.split(":");
        this.props.addDataTypeQueryForm(this.props.dataTypesByID[esplits[esplits.length-1]]);
    }

    handleTabsEdit(key, action) {
        if (action !== "remove") return;
        this.props.removeDataTypeQueryForm(this.props.dataTypesByID[key]);
    }

    render() {
        const dataTypeMenu = (
            <Menu onClick={this.handleAddDataTypeQueryForm}>
                {this.props.servicesInfo.filter(s => (this.props.dataTypes[s.id] || {items: null}).items)
                    .flatMap(s => this.props.dataTypes[s.id].items.map(dt =>
                        <Menu.Item key={`${s.id}:${dt.id}`}>{dt.id}</Menu.Item>
                    ))
                }
            </Menu>
        );

        const dataTypeTabPanes = this.props.dataTypeForms.map(d => (
            <Tabs.TabPane tab={d.dataType.id}
                          key={d.dataType.id}
                          closable={!(this.props.requiredDataTypes || []).includes(d.dataType.id)}>
                <DiscoverySearchForm conditionType="data-type"
                                     isInternal={this.props.isInternal || false}
                                     dataType={d.dataType}
                                     formValues={d.formValues}
                                     loading={this.props.searchLoading}
                                     wrappedComponentRef={form => this.forms[d.dataType.id] = form}
                                     onChange={fields => this.handleFormChange(d.dataType, fields)} />
            </Tabs.TabPane>
        ));

        const addConditionsOnDataType = (buttonProps = {style: {float: "right"}}) => (
            <Dropdown overlay={dataTypeMenu}
                      disabled={this.props.dataTypesLoading || this.props.searchLoading}>
                <Button {...buttonProps}>Add Conditions on Data Type <Icon type="down" /></Button>
            </Dropdown>
        );

        return <Card style={{marginBottom: "1.5em"}}>
            <DataTypeExplorationModal dataTypes={this.props.dataTypes}
                                      visible={this.state.schemasModalShown}
                                      onCancel={this.handleSchemasToggle} />

            <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
                Data Type Queries
                {addConditionsOnDataType()}
                <Button style={{float: "right", marginRight: "1em"}}
                        onClick={this.handleSchemasToggle}><Icon type="table" /> Explore Data Types</Button>
                <Button style={{float: "right", marginRight: "1em"}} onClick={() => {
                    /** @type {object|null} */
                    let helpModal = null;

                    const destroyHelpModal = () => {
                        this.handleSchemasToggle();
                        if (helpModal) helpModal.destroy();
                    };

                    helpModal = Modal.info({
                        title: "Help",
                        content: <>
                            <Typography.Paragraph>
                                CHORD defines multiple queryable data types for researchers to take advantage of to
                                standardize their datasets and make them discoverable. Each of these data types is
                                defined by a <strong>schema</strong>, which specifies all the components of a single
                                object in a table of a given data type. Some of the fields of these objects are
                                directly queryable, while others are not; this is determined in part by the
                                sensitivity of the field.
                            </Typography.Paragraph>
                            <Typography.Paragraph>
                                Data types and their schemas can be <a onClick={destroyHelpModal}>explored</a> in
                                both a tree and a searchable table structure.
                            </Typography.Paragraph>
                            <Typography.Paragraph>
                                If two or more data types are queried at the same time, the federated search system
                                will look for datasets that have linked data objects matching both criteria. This
                                first requires that researchers have correctly set up their datasets to link e.g.
                                patients with their corresponding genomic variants.
                            </Typography.Paragraph>
                        </>,
                        maskClosable: true,
                        width: 720
                    });
                }}><Icon type="question-circle" /> Help</Button>
            </Typography.Title>

            {this.props.dataTypeForms.length > 0
                ? <Tabs type="editable-card" hideAdd onEdit={this.handleTabsEdit}>{dataTypeTabPanes}</Tabs>
                : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added">
                        {addConditionsOnDataType({type: "primary"})}
                    </Empty>
                )}

            {/* TODO: Allow this to be optionally specified for advanced users
            <Divider />

            <Typography.Title level={3}>Join Query</Typography.Title>

            <DiscoverySearchForm conditionType="join"
                                 formValues={this.props.joinFormValues}
                                 loading={this.props.searchLoading}
                                 onChange={fields => this.props.updateJoinForm(fields)} />
            */}

            <Button type="primary"
                    icon="search"
                    loading={this.props.searchLoading}
                    disabled={this.props.dataTypeForms.length === 0}
                    onClick={() => this.handleSubmit()}>Search</Button>
        </Card>;
    }
}

DiscoveryQueryBuilder.propTypes = {
    isInternal: PropTypes.bool,
    requiredDataTypes: PropTypes.arrayOf(PropTypes.string),

    servicesInfo: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    dataTypesByID: PropTypes.object,
    dataTypesLoading: PropTypes.bool,

    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    joinFormValues: PropTypes.object,

    addDataTypeQueryForm: PropTypes.func,
    updateDataTypeQueryForm: PropTypes.func,
    removeDataTypeQueryForm: PropTypes.func,

    autoQuery: PropTypes.any, // todo: elaborate
    neutralizeAutoQueryPageTransition: PropTypes.func,

    onSubmit: PropTypes.func,
};

const mapStateToProps = state => ({
    servicesInfo: state.services.items,
    dataTypes: state.serviceDataTypes.dataTypesByServiceID,
    dataTypesByID: state.serviceDataTypes.itemsByID,

    autoQuery: state.explorer.autoQuery,

    dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetchingAll
        || Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0,
});

export default connect(mapStateToProps, {neutralizeAutoQueryPageTransition})(DiscoveryQueryBuilder);
