import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button, Card, Dropdown, Empty, Tabs, Typography } from "antd";
import { DownOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";

import { useDatasetDataTypes } from "@/modules/datasets/hooks";
import {
    setIsSubmittingSearch,
    neutralizeAutoQueryPageTransition, addDataTypeQueryForm, updateDataTypeQueryForm, removeDataTypeQueryForm,
} from "@/modules/explorer/actions";
import { useDataTypes, useServices } from "@/modules/services/hooks";
import { useAppDispatch } from "@/store";
import { nop } from "@/utils/misc";
import { OP_EQUALS } from "@/utils/search";
import { getFieldSchema } from "@/utils/schema";

import DataTypeExplorationModal from "./DataTypeExplorationModal";
import DiscoverySearchForm from "./DiscoverySearchForm";


const DiscoveryQueryBuilder = ({
    activeDataset,
    dataTypeForms,
    requiredDataTypes,
    onSubmit,
    searchLoading,
}) => {
    const dispatch = useAppDispatch();

    const { isFetching: isFetchingServiceDataTypes, itemsByID: dataTypesByID } = useDataTypes();
    const dataTypesByDataset = useDatasetDataTypes();

    const autoQuery = useSelector((state) => state.explorer.autoQuery);

    const dataTypeFormsByDatasetID = useSelector((state) => state.explorer.dataTypeFormsByDatasetID);
    const isFetchingTextSearch = useSelector((state) => state.explorer.fetchingTextSearch);

    const { isFetching: isFetchingServices } = useServices();

    const dataTypesLoading = isFetchingServices || isFetchingServiceDataTypes || dataTypesByDataset.isFetchingAll;

    const [schemasModalShown, setSchemasModalShown] = useState(false);
    const forms = useRef({});

    const handleAddDataTypeQueryForm = useCallback((e) => {
        const keySplit = e.key.split(":");
        dispatch(addDataTypeQueryForm(activeDataset, dataTypesByID[keySplit[keySplit.length - 1]]));
    }, [dispatch, activeDataset, dataTypesByID]);

    const handleTabsEdit = useCallback((key, action) => {
        if (action !== "remove") return;
        dispatch(removeDataTypeQueryForm(activeDataset, dataTypesByID[key]));
    }, [dispatch, activeDataset, dataTypesByID]);

    useEffect(() => {
        (requiredDataTypes ?? []).forEach((dt) => dispatch(addDataTypeQueryForm(activeDataset, dt)));
    }, [dispatch, requiredDataTypes]);

    useEffect(() => {
        if (autoQuery?.isAutoQuery) {
            const { autoQueryType } = autoQuery;

            // Clean old queries (if any)
            Object.values(dataTypesByID).forEach(value => handleTabsEdit(value.id, "remove"));

            // Set type of query
            handleAddDataTypeQueryForm({ key: autoQueryType });

            // The rest of the auto-query is handled by handleSetFormRef() below, upon form load.
        }
    }, [autoQuery, dataTypesByID, handleTabsEdit, handleAddDataTypeQueryForm]);

    const handleSubmit = useCallback(async () => {
        dispatch(setIsSubmittingSearch(true));

        try {
            await Promise.all(Object.values(forms.current).map((f) => f.validateFields()));
            // TODO: If error, switch to errored tab
            (onSubmit ?? nop)();
        } catch (err) {
            console.error(err);
        } finally {
            // done whether error caught or not
            dispatch(setIsSubmittingSearch(false));
        }
    }, [dispatch, onSubmit]);

    const handleFormChange = useCallback((dataType, fields) => {
        dispatch(updateDataTypeQueryForm(activeDataset, dataType, fields));
    }, [dispatch, activeDataset]);

    const handleVariantHiddenFieldChange = useCallback((fields) => {
        dispatch(updateDataTypeQueryForm(activeDataset, dataTypesByID["variant"], fields));
    }, [dispatch, activeDataset, dataTypesByID]);

    const handleHelpAndSchemasToggle = useCallback(() => {
        setSchemasModalShown(!schemasModalShown);
    }, [schemasModalShown]);

    const handleSetFormRef = useCallback((dataType, form) => {
        forms.current[dataType.id] = form;

        if (autoQuery?.isAutoQuery) {
            // If we have an auto-query on this form, trigger it when we get the ref, so we can access the form object:

            const { autoQueryType, autoQueryField, autoQueryValue } = autoQuery;
            if (autoQueryType !== dataType.id) return;

            console.debug(`executing auto-query on data type ${dataType.id}: ${autoQueryField} = ${autoQueryValue}`);

            const fieldSchema = getFieldSchema(dataType.schema, autoQueryField);

            // Set term
            const fields = [{
                name: ["conditions"],
                value: [{
                    field: autoQueryField,
                    // from utils/schema:
                    fieldSchema,
                    negated: false,
                    operation: OP_EQUALS,
                    searchValue: autoQueryValue,
                }],
            }];

            form?.setFields(fields);
            handleFormChange(dataType, fields);  // Not triggered by setFields; do it manually

            (async () => {
                // Simulate form submission click
                const s = handleSubmit();

                // Clean up auto-query "paper trail" (that is, the state segment that
                // was introduced in order to transfer intent from the OverviewContent page)
                dispatch(neutralizeAutoQueryPageTransition());

                await s;
            })();
        } else {
            // Put form fields back if they were filled out before, and we're not executing a new auto-query:

            const stateForm = (dataTypeFormsByDatasetID[activeDataset] ?? [])
                .find((f) => f.dataType.id === dataType.id);

            if (!stateForm) return;

            form?.setFields(stateForm.formValues);
        }
    }, [dispatch, autoQuery, handleFormChange, handleSubmit, dataTypeFormsByDatasetID]);

    // --- render ---

    const enabledDataTypesForDataset = useMemo(() => (
        Object.values(dataTypesByDataset.itemsByID[activeDataset] || {})
            .filter((dt) => typeof dt === "object")  // just datasets which we know data types for
            .flatMap(Object.values)
            .filter((dt) => (dt.queryable ?? true) && dt.count > 0)  // just queryable data types w/ a positive count
    ), [dataTypesByDataset, activeDataset]);

    // Filter out services without data types and then flat-map the service's data types to make the dropdown.
    const dataTypeMenu = useMemo(() => ({
        onClick: handleAddDataTypeQueryForm,
        items: enabledDataTypesForDataset.map((dt) => ({
            key: `${activeDataset}:${dt.id}`,
            label: <>{dt.label ?? dt.id}</>,
        })),
    }), [handleAddDataTypeQueryForm, enabledDataTypesForDataset, activeDataset]);

    const dataTypeTabItems = useMemo(() => dataTypeForms.map(({ dataType }) => {
        // Use data type label for tab name, unless it isn't specified - then fall back to ID.
        // This behaviour should be the same everywhere in bento_web or almost anywhere the
        // data type is shown to 'end users'.
        const { id, label } = dataType;
        return ({
            key: id,
            label: label ?? id,
            closable: !(requiredDataTypes ?? []).includes(id),
            children: (
                <DiscoverySearchForm
                    dataType={dataType}
                    loading={searchLoading}
                    setFormRef={(form) => handleSetFormRef(dataType, form)}
                    onChange={(fields) => handleFormChange(dataType, fields)}
                    handleVariantHiddenFieldChange={handleVariantHiddenFieldChange}
                />
            ),
        });
    }), [
        requiredDataTypes,
        dataTypeForms,
        searchLoading,
        handleSetFormRef,
        handleFormChange,
        handleVariantHiddenFieldChange,
    ]);

    const addConditionsOnDataType = (buttonProps = { style: { float: "right" } }) => (
        <Dropdown
            menu={dataTypeMenu}
            disabled={dataTypesLoading || searchLoading || enabledDataTypesForDataset?.length === 0}>
            <Button {...buttonProps}><PlusOutlined /> Data Type <DownOutlined /></Button>
        </Dropdown>
    );

    return (
        <Card style={{ marginBottom: "1.5em" }}>
            <DataTypeExplorationModal
                dataTypes={enabledDataTypesForDataset}
                open={schemasModalShown}
                onCancel={handleHelpAndSchemasToggle}
            />

            <Typography.Title level={3} style={{ margin: "0 0 1.5rem 0" }}>
                Advanced Search
                {addConditionsOnDataType()}
                <Button
                    icon={<QuestionCircleOutlined />}
                    style={{ float: "right", marginRight: "1em" }}
                    disabled={enabledDataTypesForDataset?.length === 0}
                    onClick={handleHelpAndSchemasToggle}
                >
                    Help
                </Button>
            </Typography.Title>

            {dataTypeForms.length > 0
                ? <Tabs type="editable-card" hideAdd onEdit={handleTabsEdit} items={dataTypeTabItems} />
                : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added">
                        {addConditionsOnDataType({ type: "primary" })}
                    </Empty>
                )}

            <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={searchLoading}
                disabled={dataTypeForms.length === 0 || isFetchingTextSearch}
                onClick={handleSubmit}
            >Search</Button>
        </Card>
    );
};

DiscoveryQueryBuilder.propTypes = {
    activeDataset: PropTypes.string,
    requiredDataTypes: PropTypes.arrayOf(PropTypes.string),
    dataTypeForms: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSubmit: PropTypes.func,
    searchLoading: PropTypes.bool,
};

export default DiscoveryQueryBuilder;
