import { LinkOutlined } from "@ant-design/icons";
import type { ColumnFilterItem } from "antd/es/table/interface";

type ExcludedProps = {
  model: "phenotype" | "disease";
};

type ExcludedTableColumnFilterConfig = {
  filters: ColumnFilterItem[];
  onFilter: (value: "excluded" | "not_excluded", record: { excluded: boolean }) => boolean;
};

export const excludedTableColumnFilterConfig: ExcludedTableColumnFilterConfig = {
  filters: [
    { text: "Excluded", value: "excluded" },
    { text: "Not Excluded", value: "not_excluded" },
  ],
  onFilter: (value, { excluded }) => (value === "excluded" ? excluded : !excluded),
};

const Excluded = ({ model }: ExcludedProps) => (
  <span style={{ color: "#CC3333" }}>
    (<span style={{ fontWeight: "bold" }}>Excluded:</span> Found to be absent{" "}
    <a
      href={`https://phenopacket-schema.readthedocs.io/en/2.0.0/${model}.html#excluded`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <LinkOutlined />
    </a>
    )
  </span>
);

export default Excluded;
