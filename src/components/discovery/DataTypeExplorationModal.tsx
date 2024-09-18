import { type ChangeEvent, type CSSProperties, useCallback, useMemo, useState } from "react";

import {
  Divider,
  Input,
  Modal,
  Radio,
  type RadioChangeEvent,
  type RadioGroupProps,
  Table,
  type TableColumnsType,
  Tabs,
  Typography,
} from "antd";
import { PlusOutlined, ShareAltOutlined, TableOutlined } from "@ant-design/icons";

import SchemaTree from "../schema_trees/SchemaTree";
import type { BentoDataType } from "@/modules/services/types";
import { generateSchemaTreeData, generateSchemaTableData } from "@/utils/schema";
import { nop } from "@/utils/misc";

const styles: Record<string, CSSProperties> = {
  viewRadioContainer: { position: "relative" },
  viewRadioGroup: { position: "absolute", top: 0, right: 0, zIndex: 50 },
  fieldSearch: { marginBottom: "16px" },
  tableKey: { fontFamily: "monospace", fontSize: "12px", whiteSpace: "nowrap" },
};

const VIEW_RADIO_OPTIONS: RadioGroupProps["options"] = [
  {
    value: "tree",
    label: (
      <>
        <ShareAltOutlined /> Tree View
      </>
    ),
  },
  {
    value: "table",
    label: (
      <>
        <TableOutlined /> Table Detail View
      </>
    ),
  },
];

// TODO: Add more columns
const FIELD_COLUMNS: TableColumnsType = [
  {
    title: "Key",
    dataIndex: "key",
    render: (t: string) => <span style={styles.tableKey}>{t}</span>,
  },
  { title: "JSON Type", dataIndex: ["data", "type"] },
  { title: "Description", dataIndex: ["data", "description"] },
];

type DataTypeExplorationModalProps = {
  dataTypes: BentoDataType[];
  open?: boolean;
  onCancel?: () => void;
};

const DataTypeExplorationModal = ({ dataTypes, open, onCancel }: DataTypeExplorationModalProps) => {
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("");

  const onViewChange = useCallback((e: RadioChangeEvent) => setView(e.target.value), []);

  const onFilterChange = useCallback((v: ChangeEvent<HTMLInputElement>) => {
    setFilter(v.target.value.toLocaleLowerCase().trim());
  }, []);

  const applyFilterToTableData = useCallback(
    (l: { key: string; data: { description?: string } }[]) =>
      filter === ""
        ? l
        : l.filter(
            (f) =>
              f.key.toLocaleLowerCase().includes(filter) ||
              (f.data.description || "").toLocaleLowerCase().includes(filter),
          ),
    [filter],
  );

  const getTableData = useCallback(
    (d: BentoDataType) =>
      // TODO: Cache tree data for data type
      applyFilterToTableData(generateSchemaTableData(generateSchemaTreeData(d.schema))),
    [applyFilterToTableData],
  );

  const tabItems = useMemo(
    () =>
      (dataTypes ?? []).map((dataType) => ({
        key: dataType.id,
        label: dataType.label ?? dataType.id,
        children:
          view === "tree" ? (
            <SchemaTree schema={dataType.schema} />
          ) : (
            <>
              <Input.Search
                allowClear={true}
                onChange={onFilterChange}
                placeholder="Search for a field..."
                style={styles.fieldSearch}
              />
              <Table bordered={true} columns={FIELD_COLUMNS} dataSource={getTableData(dataType)} />
            </>
          ),
      })),
    [dataTypes, getTableData, onFilterChange, view],
  );

  return (
    <Modal title="Help" open={open} width={1280} onCancel={onCancel ?? nop} footer={null}>
      <Typography.Paragraph>
        Bento separates data types across multiple queryable data services. For instance, clinical and phenotypic data
        is stored in the Katsu data service, while genomic data is stored in the Gohan data service. Each data service
        has its own set of queryable properties, and parameters for multiple data types can be used in the same query.
        If two or more data types are queried at the same time, an aggregation service will look for datasets that have
        linked data objects matching both criteria.
      </Typography.Paragraph>
      <Typography.Paragraph>
        To run a query on a data type, click on the &ldquo;
        <PlusOutlined /> Data Type&rdquo; button in the &ldquo;Advanced Search&rdquo; section of the explorer and choose
        the data type you want to add query conditions on.
      </Typography.Paragraph>

      <Divider />

      <Typography.Title level={3}>Data Types</Typography.Title>
      <div style={styles.viewRadioContainer}>
        <Radio.Group
          value={view}
          onChange={onViewChange}
          buttonStyle="solid"
          optionType="button"
          style={styles.viewRadioGroup}
          options={VIEW_RADIO_OPTIONS}
        />
        <Tabs items={tabItems} />
      </div>
    </Modal>
  );
};

export default DataTypeExplorationModal;
