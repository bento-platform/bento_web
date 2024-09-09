import { useEffect, useMemo, useState } from "react";
import { Radio } from "antd";

import { BENTO_DROP_BOX_FS_BASE_PATH } from "@/config";
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
      basePrefix={BENTO_DROP_BOX_FS_BASE_PATH}
      multiple={false}
      nodeEnabled={dropBoxTreeNodeEnabledJson}
      allowClear={true}
      value={selectedFile}
      onChange={(v) => setSelectedFile(v)}
    />
  );
};

const EXISTING = "existing";
const NEW = "new";
const NONE = "none";
type DROP_BOX_SELECT_TYPE = typeof EXISTING | typeof NEW | typeof NONE;

export type DropBoxJsonSelectProps = {
  initialValue?: JSONType;
  value?: JSONType;
  onChange?: (x: JSONType) => void;
  nullable?: boolean;
};

/** A form input component for DropBox JSON file selection. */
const DropBoxJsonSelect = ({ initialValue, onChange, nullable = false }: DropBoxJsonSelectProps) => {
  const editing = initialValue !== undefined;

  const [radioValue, setRadioValue] = useState<DROP_BOX_SELECT_TYPE>(editing ? EXISTING : NEW);
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);

  const currentFieldData = useDropBoxJsonContent(selectedFile, null);

  const selection = useMemo(() => {
    switch (radioValue) {
      case NEW:
        return currentFieldData;
      case EXISTING:
        return initialValue ?? null;
      case NONE:
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
          <Radio value={EXISTING}>Existing value</Radio>
          <Radio value={NEW}>New value from file</Radio>
          {nullable && <Radio value={NONE}>None</Radio>}
        </Radio.Group>
      )}

      {radioValue === NEW && <InnerDropBoxJsonSelect selectedFile={selectedFile} setSelectedFile={setSelectedFile} />}

      {(radioValue !== NEW || selectedFile) && (
        <JsonDisplay showObjectWithReactJson={true} jsonSrc={selection} showArrayTitle={false} />
      )}
    </div>
  );
};

export default DropBoxJsonSelect;
