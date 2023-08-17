import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Dropdown, Empty, Icon, Menu, Tabs, Typography} from "antd";

import DataTypeExplorationModal from "./DataTypeExplorationModal";
import DiscoverySearchForm from "./DiscoverySearchForm";
import {nop} from "../../utils/misc";

import {OP_EQUALS} from "../../utils/search";
import {getFieldSchema} from "../../utils/schema";

import { neutralizeAutoQueryPageTransition, setIsSubmittingSearch } from "../../modules/explorer/actions";

class DiscoveryQueryBuilder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            schemasModalShown: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleHelpAndSchemasToggle = this.handleHelpAndSchemasToggle.bind(this);

        this.handleAddDataTypeQueryForm = this.handleAddDataTypeQueryForm.bind(this);
        this.handleTabsEdit = this.handleTabsEdit.bind(this);
        this.handleVariantHiddenFieldChange = this.handleVariantHiddenFieldChange.bind(this);

        this.forms = {};
    }

    componentDidMount() {
        (this.props.requiredDataTypes ?? []).forEach(dt => this.props.addDataTypeQueryForm(dt));

        if (this.props.autoQuery?.isAutoQuery) {
            // Trigger a cascade of async functions
            // that involve waiting for redux actions to reduce (complete)
            // before triggering others
            (async () => {
                // Clean old queries (if any)
                Object.values(this.props.dataTypesByID).forEach(value =>
                    this.handleTabsEdit(value.id, "remove"));

                // Set type of query
                await this.handleAddDataTypeQueryForm({key: this.props.autoQuery.autoQueryType});

                // Set term
                const dataType = this.props.dataTypesByID[this.props.autoQuery.autoQueryType];
                const fields = {
                    keys: {
                        value:[0],
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
                            searchValue: this.props.autoQuery.autoQueryValue,
                        },
                    }],
                };

                // "Simulate" form data structure and trigger update
                await this.handleFormChange(dataType, fields);

                // Simulate form submission click
                const s = this.handleSubmit();

                // Clean up auto-query "paper trail" (that is, the state segment that
                // was introduced in order to transfer intent from the OverviewContent page)
                this.props.neutralizeAutoQueryPageTransition();

                await s;
            })();
        }
    }

    handleSubmit = async () => {
        this.props.setIsSubmittingSearch(true);

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

            (this.props.onSubmit ?? nop)();
        } catch (err) {
            console.error(err);
        } finally {
            // done whether error caught or not
            this.props.setIsSubmittingSearch(false);
        }

    };

    handleFormChange(dataType, fields) {
        this.props.updateDataTypeQueryForm(dataType, fields);
    }

    handleVariantHiddenFieldChange(fields) {
        this.props.updateDataTypeQueryForm(this.props.dataTypesByID["variant"], fields);
    }

    handleHelpAndSchemasToggle() {
        this.setState({schemasModalShown: !this.state.schemasModalShown});
    }

    handleAddDataTypeQueryForm(e) {
        const keySplit = e.key.split(":");
        this.props.addDataTypeQueryForm(this.props.dataTypesByID[keySplit[keySplit.length - 1]]);
    }

    handleTabsEdit(key, action) {
        if (action !== "remove") return;
        this.props.removeDataTypeQueryForm(this.props.dataTypesByID[key]);
    }

    render() {
        const variantDatasetIds = this.props.serviceTables.items
            .filter(item => item.data_type === "variant")
            .map(item => item.dataset);

        const { activeDataset, dataTypesByDataset } = this.props;
        const items = dataTypesByDataset.itemsByDatasetID[activeDataset] || [];

        const filteredItems = items
            .filter(dt => (dt.queryable ?? true) && dt.count > 0)
            .filter(dt => dt.data_type === "variant" || variantDatasetIds.includes(activeDataset));

        const dataTypeMenu = (
            <Menu onClick={this.handleAddDataTypeQueryForm}>
                {filteredItems.map(dt => (
                    <Menu.Item key={`${activeDataset}:${dt.id}`}>{dt.label ?? dt.id}</Menu.Item>
                ))}
            </Menu>
        );

        const dataTypeTabPanes = this.props.dataTypeForms.map(({dataType, formValues}) => {
            // Use data type label for tab name, unless it isn't specified - then fall back to ID.
            // This behaviour should be the same everywhere in bento_web or almost anywhere the
            // data type is shown to 'end users'.
            const {id, label} = dataType;
            return <Tabs.TabPane tab={label ?? id}
                                 key={id}
                                 closable={!(this.props.requiredDataTypes ?? []).includes(id)}>
                <DiscoverySearchForm
                    conditionType="data-type"
                    isInternal={this.props.isInternal ?? false}
                    dataType={dataType}
                    formValues={formValues}
                    loading={this.props.searchLoading}
                    wrappedComponentRef={form => this.forms[id] = form}
                    onChange={fields => this.handleFormChange(dataType, fields)}
                    handleVariantHiddenFieldChange={this.handleVariantHiddenFieldChange}
                />
            </Tabs.TabPane>;
        });

        const addConditionsOnDataType = (buttonProps = {style: {float: "right"}}) => (
            <Dropdown overlay={dataTypeMenu}
                      disabled={this.props.dataTypesLoading || this.props.searchLoading}>
                <Button {...buttonProps}> <Icon type="plus" /> Data Type <Icon type="down" /></Button>
            </Dropdown>
        );

        return <Card style={{marginBottom: "1.5em"}}>
            <DataTypeExplorationModal
                visible={this.state.schemasModalShown}
                onCancel={this.handleHelpAndSchemasToggle}
                dataTypes={filteredItems}
            />

            <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
                Advanced Search
                {addConditionsOnDataType()}
                <Button style={{float: "right", marginRight: "1em"}}
                        onClick={this.handleHelpAndSchemasToggle}><Icon type="question-circle" /> Help</Button>
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
                    disabled={this.props.dataTypeForms.length === 0 || this.props.isFetchingTextSearch}
                    onClick={() => this.handleSubmit()}>Search</Button>
        </Card>;
    }
}

DiscoveryQueryBuilder.propTypes = {
    activeDataset: PropTypes.string,
    isInternal: PropTypes.bool,
    requiredDataTypes: PropTypes.arrayOf(PropTypes.string),

    servicesInfo: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    dataTypesByID: PropTypes.object,
    dataTypesLoading: PropTypes.bool,
    dataTypesByDataset: PropTypes.object,
    serviceTables: PropTypes.object,

    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    joinFormValues: PropTypes.object,
    isFetchingTextSearch: PropTypes.bool,

    addDataTypeQueryForm: PropTypes.func,
    updateDataTypeQueryForm: PropTypes.func,
    removeDataTypeQueryForm: PropTypes.func,

    autoQuery: PropTypes.any, // todo: elaborate
    neutralizeAutoQueryPageTransition: PropTypes.func,

    onSubmit: PropTypes.func,
    setIsSubmittingSearch: PropTypes.func,
};

const mapStateToProps = state => ({
    servicesInfo: state.services.items,
    dataTypes: state.serviceDataTypes.dataTypesByServiceID,
    dataTypesByID: state.serviceDataTypes.itemsByID,
    dataTypesByDataset: state.serviceDataTypes,
    serviceTables: state.serviceTables,

    autoQuery: state.explorer.autoQuery,
    isFetchingTextSearch: state.explorer.fetchingTextSearch || false,

    dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetchingAll
        || Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0,
});

const mapDispatchToProps = (dispatch) => ({
    neutralizeAutoQueryPageTransition: () => dispatch(neutralizeAutoQueryPageTransition()),
    setIsSubmittingSearch: (isSubmittingSearch) => dispatch(setIsSubmittingSearch(isSubmittingSearch)),
});


export default connect(mapStateToProps, mapDispatchToProps)(DiscoveryQueryBuilder);
