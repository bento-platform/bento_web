import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Button, Card, Dropdown, Empty, Tabs, Typography } from "antd";
import { DownOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";

import { useDatasetDataTypes } from "@/modules/datasets/hooks";
import {
  setIsSubmittingSearch,
  clearSearch,
  neutralizeAutoQueryPageTransition,
  addDataTypeQueryForm,
  updateDataTypeQueryForm,
  removeDataTypeQueryForm,
} from "@/modules/explorer/actions";
import { useDataTypes, useServices } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { nop } from "@/utils/misc";
import { OP_EQUALS } from "@/utils/search";
import { getFieldSchema } from "@/utils/schema";

import DataTypeExplorationModal from "./DataTypeExplorationModal";
import DiscoverySearchForm from "./DiscoverySearchForm";

const DiscoveryQueryBuilder = ({ activeDataset, dataTypeForms, requiredDataTypes, onSubmit, searchLoading }) => {
  const dispatch = useAppDispatch();

  const { isFetching: isFetchingServiceDataTypes, itemsByID: dataTypesByID } = useDataTypes();
  const dataTypesByDataset = useDatasetDataTypes();
  const { isFetching: isFetchingServices } = useServices();

  const { autoQuery, fetchingTextSearch } = useAppSelector((state) => state.explorer);

  // Mini state machine: when auto query is set:
  //  1. clear form(s) and set this to true;
  //  2. re-create forms and wait to receive ref;
  //  3. if this is true, and we have refs, execute part two of auto-query.
  const [shouldExecAutoQueryPt2, setShouldExecAutoQueryPt2] = useState(false);

  const dataTypesLoading = isFetchingServices || isFetchingServiceDataTypes || dataTypesByDataset.isFetchingAll;

  const [schemasModalShown, setSchemasModalShown] = useState(false);
  const [forms, setForms] = useState({});

  const handleAddDataTypeQueryForm = useCallback(
    (e) => {
      const keySplit = e.key.split(":");
      dispatch(addDataTypeQueryForm(activeDataset, dataTypesByID[keySplit[keySplit.length - 1]]));
    },
    [dispatch, activeDataset, dataTypesByID],
  );

  const handleTabsEdit = useCallback(
    (key, action) => {
      if (action !== "remove") return;
      dispatch(removeDataTypeQueryForm(activeDataset, dataTypesByID[key]));
    },
    [dispatch, activeDataset, dataTypesByID],
  );

  useEffect(() => {
    (requiredDataTypes ?? []).forEach((dt) => dispatch(addDataTypeQueryForm(activeDataset, dt)));
  }, [dispatch, requiredDataTypes, activeDataset]);

  useEffect(() => {
    if (autoQuery?.isAutoQuery && !shouldExecAutoQueryPt2) {
      const { autoQueryType } = autoQuery;

      // Clean old queries (if any)
      Object.values(dataTypesByID).forEach((value) => handleTabsEdit(value.id, "remove"));

      // Clean old search results
      dispatch(clearSearch(activeDataset));

      // Set type of query
      handleAddDataTypeQueryForm({ key: autoQueryType });

      // The rest of the auto-query is handled by a second effect, after we receive the new form ref.
      setShouldExecAutoQueryPt2(true);
    }
  }, [
    activeDataset,
    autoQuery,
    shouldExecAutoQueryPt2,
    dataTypesByID,
    dispatch,
    handleTabsEdit,
    handleAddDataTypeQueryForm,
  ]);

  const handleSubmit = useCallback(async () => {
    dispatch(setIsSubmittingSearch(true));

    try {
      await Promise.all(Object.values(forms).map((f) => f.validateFields()));
      // TODO: If error, switch to errored tab
      (onSubmit ?? nop)();
    } catch (err) {
      console.error(err);
    } finally {
      // done whether error caught or not
      dispatch(setIsSubmittingSearch(false));
    }
  }, [dispatch, forms, onSubmit]);

  const handleFormChange = useCallback(
    (dataType) => (fields) => dispatch(updateDataTypeQueryForm(activeDataset, dataType, fields)),
    [dispatch, activeDataset],
  );
  const handleVariantHiddenFieldChange = useMemo(
    () => handleFormChange(dataTypesByID["variant"]),
    [handleFormChange, dataTypesByID],
  );

  const handleHelpAndSchemasToggle = useCallback(() => {
    setSchemasModalShown((s) => !s);
  }, []);

  const handleSetFormRef = (dataType) => (form) => {
    // Without a functional state update, this triggers an infinite loop in rendering variant search
    setForms((fs) => ({ ...fs, [dataType.id]: form }));
  };

  useEffect(() => {
    if (autoQuery?.isAutoQuery && shouldExecAutoQueryPt2) {
      const { autoQueryType, autoQueryField, autoQueryValue } = autoQuery;

      const form = forms[autoQueryType];

      if (!form) {
        // No ref yet; wait for form ref for this data type
        return;
      }

      const dataType = dataTypesByID[autoQueryType];

      console.debug(`executing auto-query on data type ${dataType.id}: ${autoQueryField} = ${autoQueryValue}`);

      const fieldSchema = getFieldSchema(dataType.schema, autoQueryField);

      // Set term
      const fields = [
        {
          name: ["conditions"],
          value: [
            {
              field: autoQueryField,
              // from utils/schema:
              fieldSchema,
              negated: false,
              operation: OP_EQUALS,
              searchValue: autoQueryValue,
            },
          ],
        },
      ];

      form.setFields(fields);
      handleFormChange(dataType)(fields); // Not triggered by setFields; do it manually

      (async () => {
        // Simulate form submission click
        const s = handleSubmit();

        // Clean up auto-query "paper trail" (that is, the state segment that
        // was introduced in order to transfer intent from the OverviewContent page)
        dispatch(neutralizeAutoQueryPageTransition());
        setShouldExecAutoQueryPt2(false);

        await s;
      })();
    }
  }, [dispatch, autoQuery, dataTypesByID, forms, shouldExecAutoQueryPt2, handleFormChange, handleSubmit]);

  // --- render ---

  const enabledDataTypesForDataset = useMemo(
    () =>
      Object.values(dataTypesByDataset.itemsByID[activeDataset] || {})
        .filter((dt) => typeof dt === "object") // just datasets which we know data types for
        .flatMap(Object.values)
        .filter((dt) => (dt.queryable ?? true) && dt.count > 0) // just queryable data types w/ a positive count
        .sort((a, b) => {
          const labelA = (a.label ?? a.id).toString().toLowerCase();
          const labelB = (b.label ?? b.id).toString().toLowerCase();
          return labelA.localeCompare(labelB);
        }),
    [dataTypesByDataset, activeDataset],
  );

  // Filter out services without data types and then flat-map the service's data types to make the dropdown.
  const dataTypeMenu = useMemo(
    () => ({
      onClick: handleAddDataTypeQueryForm,
      items: enabledDataTypesForDataset.map((dt) => ({
        key: `${activeDataset}:${dt.id}`,
        label: <>{dt.label ?? dt.id}</>,
      })),
    }),
    [handleAddDataTypeQueryForm, enabledDataTypesForDataset, activeDataset],
  );

  const dataTypeTabItems = useMemo(
    () =>
      dataTypeForms.map(({ dataType }) => {
        // Use data type label for tab name, unless it isn't specified - then fall back to ID.
        // This behaviour should be the same everywhere in bento_web or almost anywhere the
        // data type is shown to 'end users'.
        const handleChange = handleFormChange(dataType);
        const setFormRef = handleSetFormRef(dataType);
        const { id, label } = dataType;
        return {
          key: id,
          label: label ?? id,
          closable: !(requiredDataTypes ?? []).includes(id),
          children: (
            <DiscoverySearchForm
              dataType={dataType}
              loading={searchLoading}
              setFormRef={setFormRef}
              onChange={handleChange}
              handleVariantHiddenFieldChange={handleVariantHiddenFieldChange}
            />
          ),
        };
      }),
    [requiredDataTypes, dataTypeForms, searchLoading, handleFormChange, handleVariantHiddenFieldChange],
  );

  const addConditionsOnDataType = (buttonProps = { style: { float: "right" } }) => (
    <Dropdown
      menu={dataTypeMenu}
      disabled={dataTypesLoading || searchLoading || enabledDataTypesForDataset?.length === 0}
    >
      <Button {...buttonProps}>
        <PlusOutlined /> Data Type <DownOutlined />
      </Button>
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

      {dataTypeForms.length > 0 ? (
        <Tabs type="editable-card" hideAdd onEdit={handleTabsEdit} items={dataTypeTabItems} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added">
          {addConditionsOnDataType({ type: "primary" })}
        </Empty>
      )}

      <Button
        type="primary"
        icon={<SearchOutlined />}
        loading={searchLoading}
        disabled={dataTypeForms.length === 0 || fetchingTextSearch}
        onClick={handleSubmit}
      >
        Search
      </Button>
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
