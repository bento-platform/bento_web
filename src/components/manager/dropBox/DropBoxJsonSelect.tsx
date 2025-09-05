import { useEffect, useMemo, useState } from "react";
import { Radio, Alert} from "antd";

import { useDropBoxJsonContent } from "@/modules/dropBox/hooks";
import { dropBoxTreeNodeEnabledJson } from "@/utils/files";

import DropBoxTreeSelect from "./DropBoxTreeSelect";
import JsonDisplay from "@/components/display/JsonDisplay";
import type { JSONType } from "@/types/json";

const InnerDropBoxJsonSelect = ({
  selectedFile,
  setSelectedFile,
}: {
  selectedFile?: string;
  setSelectedFile: (x: string) => void;
}) => {
  return (
    <DropBoxTreeSelect
      multiple={false}
      nodeEnabled={dropBoxTreeNodeEnabledJson}
      allowClear={true}
      value={selectedFile}
      onChange={(v) => setSelectedFile(v)}
    />
  );
};

enum DropBoxSelectType {
  New = "new",
  Existing = "existing",
  None = "none",
}

export type DropBoxJsonSelectProps = {
  initialValue?: JSONType;
  value?: JSONType;
  onChange?: (x: JSONType) => void;
  nullable?: boolean;
};

/** A form input component for DropBox JSON file selection. */
const DropBoxJsonSelect = ({ initialValue, onChange, nullable = false }: DropBoxJsonSelectProps) => {
  const editing = initialValue !== undefined;

  const [radioValue, setRadioValue] = useState<DropBoxSelectType>(
    editing ? DropBoxSelectType.Existing : DropBoxSelectType.New,
  );
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);

  const [currentFieldData, error] = useDropBoxJsonContent(selectedFile, null);

  const selection = useMemo(() => {
    switch (radioValue) {
      case DropBoxSelectType.New:
        return currentFieldData;
      case DropBoxSelectType.Existing:
        return initialValue ?? null;
      case DropBoxSelectType.None:
      default:
        return null;
    }
  }, [radioValue, currentFieldData, initialValue]);

  useEffect(() => {
    if (onChange) {
      onChange(selection);
    }
  }, [onChange, selection]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {editing && (
        <Radio.Group value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
          <Radio value={DropBoxSelectType.Existing}>Existing value</Radio>
          <Radio value={DropBoxSelectType.New}>New value from file</Radio>
          {nullable && <Radio value={DropBoxSelectType.None}>None</Radio>}
        </Radio.Group>
      )}

      {radioValue === DropBoxSelectType.New && (
        <InnerDropBoxJsonSelect selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      )}

      {radioValue === DropBoxSelectType.New && error ? (
        <Alert message="Config error" description={error} type="error" showIcon={true} />
      ) : (
        (radioValue !== DropBoxSelectType.New || selectedFile) && (
          <JsonDisplay showObjectWithReactJson={true} jsonSrc={selection} showArrayTitle={false} />
        )
      )}
    </div>
  );
};

export default DropBoxJsonSelect;
