import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import { Button, Card, Dropdown, Empty, Tabs, Typography } from "antd";
import { DownOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";

import DataTypeExplorationModal from "./DataTypeExplorationModal";
import DiscoverySearchForm from "./DiscoverySearchForm";
import {nop} from "@/utils/misc";

import {OP_EQUALS} from "@/utils/search";
import {getFieldSchema} from "@/utils/schema";

import { neutralizeAutoQueryPageTransition, setIsSubmittingSearch } from "@/modules/explorer/actions";

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
        const {
            dataTypesByID,
            requiredDataTypes,
            addDataTypeQueryForm,
            autoQuery,
            neutralizeAutoQueryPageTransition,
        } = this.props;

        (requiredDataTypes ?? []).forEach(dt => addDataTypeQueryForm(dt));

        if (autoQuery?.isAutoQuery) {
            const { autoQueryType, autoQueryField, autoQueryValue } = autoQuery;

            // Trigger a cascade of async functions
            // that involve waiting for redux actions to reduce (complete)
            // before triggering others
            (async () => {
                // Clean old queries (if any)
                Object.values(dataTypesByID).forEach(value => this.handleTabsEdit(value.id, "remove"));

                // Set type of query
                await this.handleAddDataTypeQueryForm({ key: autoQueryType });

                // Set term
                const dataType = dataTypesByID[autoQueryType];
                const fields = [{
                    name: ["conditions"],
                    value: [{
                        field: autoQueryField,
                        // from utils/schema:
                        fieldSchema: getFieldSchema(dataType.schema, autoQueryField),
                        negated: false,
                        operation: OP_EQUALS,
                        searchValue: autoQueryValue,
                    }],
                }];

                // Force-override fields in the form
                const form = this.forms[dataType.id];

                if (!form) {
                    console.warn(`Missing form ref for data type with ID ${dataType.id}`);
                }

                form?.setFields(fields);
                await this.handleFormChange(dataType, fields);  // Not triggered by setFields; do it manually

                // Simulate form submission click
                const s = this.handleSubmit();

                // Clean up auto-query "paper trail" (that is, the state segment that
                // was introduced in order to transfer intent from the OverviewContent page)
                neutralizeAutoQueryPageTransition();

                await s;
            })();
        }
    }

    handleSubmit = async () => {
        this.props.setIsSubmittingSearch(true);

        try {
            await Promise.all(Object.values(this.forms).map((f) => f.validateFields()));
            // TODO: If error, switch to errored tab
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
        const { activeDataset, dataTypesByDataset, dataTypeForms } = this.props;

        const dataTypesForActiveDataset = Object.values(dataTypesByDataset.itemsByID[activeDataset] || {})
            .filter(dt => typeof dt === "object");

        const filteredDataTypes = dataTypesForActiveDataset
            .flatMap(Object.values)
            .filter(dt => (dt.queryable ?? true) && dt.count > 0);

        // Filter out services without data types and then flat-map the service's data types to make the dropdown.
        const dataTypeMenu = {
            onClick: this.handleAddDataTypeQueryForm,
            items: filteredDataTypes.map((dt) => ({
                key: `${activeDataset}:${dt.id}`,
                label: <>{dt.label ?? dt.id}</>,
            })),
        };

        const dataTypeTabItems = dataTypeForms.map(({dataType, formValues}) => {
            // Use data type label for tab name, unless it isn't specified - then fall back to ID.
            // This behaviour should be the same everywhere in bento_web or almost anywhere the
            // data type is shown to 'end users'.
            const { id, label } = dataType;
            return ({
                key: id,
                label: label ?? id,
                closable: !(this.props.requiredDataTypes ?? []).includes(id),
                children: (
                    <DiscoverySearchForm
                        dataType={dataType}
                        formValues={formValues}
                        loading={this.props.searchLoading}
                        setFormRef={(form) => this.forms[id] = form}
                        onChange={fields => this.handleFormChange(dataType, fields)}
                        handleVariantHiddenFieldChange={this.handleVariantHiddenFieldChange}
                    />
                ),
            });
        });

        const addConditionsOnDataType = (buttonProps = {style: {float: "right"}}) => (
            <Dropdown
                menu={dataTypeMenu}
                disabled={this.props.dataTypesLoading || this.props.searchLoading || filteredDataTypes?.length === 0 }>
                <Button {...buttonProps}><PlusOutlined /> Data Type <DownOutlined /></Button>
            </Dropdown>
        );

        return <Card style={{marginBottom: "1.5em"}}>
            <DataTypeExplorationModal
                dataTypes={filteredDataTypes}
                open={this.state.schemasModalShown}
                onCancel={this.handleHelpAndSchemasToggle}
            />

            <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
                Advanced Search
                {addConditionsOnDataType()}
                <Button
                    style={{float: "right", marginRight: "1em"}}
                    disabled={filteredDataTypes?.length === 0}
                    onClick={this.handleHelpAndSchemasToggle}>
                    <QuestionCircleOutlined /> Help
                </Button>
            </Typography.Title>

            {dataTypeForms.length > 0
                ? <Tabs type="editable-card" hideAdd onEdit={this.handleTabsEdit} items={dataTypeTabItems} />
                : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added">
                        {addConditionsOnDataType({type: "primary"})}
                    </Empty>
                )}

            <Button type="primary"
                    icon={<SearchOutlined />}
                    loading={this.props.searchLoading}
                    disabled={dataTypeForms.length === 0 || this.props.isFetchingTextSearch}
                    onClick={() => this.handleSubmit()}>Search</Button>
        </Card>;
    }
}

DiscoveryQueryBuilder.propTypes = {
    activeDataset: PropTypes.string,
    requiredDataTypes: PropTypes.arrayOf(PropTypes.string),

    servicesInfo: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    dataTypesByID: PropTypes.object,
    dataTypesLoading: PropTypes.bool,
    dataTypesByDataset: PropTypes.object,

    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object).isRequired,
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
    dataTypesByID: state.serviceDataTypes.itemsByID,
    dataTypesByDataset: state.datasetDataTypes,

    autoQuery: state.explorer.autoQuery,
    isFetchingTextSearch: state.explorer.fetchingTextSearch || false,

    dataTypesLoading: state.services.isFetching
        || state.serviceDataTypes.isFetching
        || state.datasetDataTypes.isFetchingAll,
});

const mapDispatchToProps = (dispatch) => ({
    neutralizeAutoQueryPageTransition: () => dispatch(neutralizeAutoQueryPageTransition()),
    setIsSubmittingSearch: (isSubmittingSearch) => dispatch(setIsSubmittingSearch(isSubmittingSearch)),
});


export default connect(mapStateToProps, mapDispatchToProps)(DiscoveryQueryBuilder);
