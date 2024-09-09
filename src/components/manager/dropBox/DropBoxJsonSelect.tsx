import { useEffect, useState } from "react";
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

export type DropBoxJsonSelectProps = {
  initialValue?: JSONType;
  value?: JSONType;
  onChange?: (x: JSONType) => void;
};

/**
 * Acts as an antd Form.Item wrapper for DropBox JSON file selection.
 * Must be the child of an antd Form component.
 * The JSON data can be retrieved from the form using the 'name' prop.
 */
const DropBoxJsonSelect = ({ initialValue, onChange }: DropBoxJsonSelectProps) => {
  const editing = initialValue !== undefined;

  const [radioValue, setRadioValue] = useState<"existing" | "new">(editing ? "existing" : "new");
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);

  const currentFieldData = useDropBoxJsonContent(selectedFile, null);

  useEffect(() => {
    if (onChange) {
      if (radioValue === "new") {
        onChange(currentFieldData);
      } else {
        onChange(initialValue ?? null);
      }
    }
  }, [currentFieldData, initialValue, onChange, radioValue]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {editing && (
        <Radio.Group value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
          <Radio value="existing">Existing value</Radio>
          <Radio value="new">New value from file</Radio>
        </Radio.Group>
      )}

      {radioValue === "new" && <InnerDropBoxJsonSelect selectedFile={selectedFile} setSelectedFile={setSelectedFile} />}

      {(radioValue !== "new" || selectedFile) && (
        <JsonDisplay
          showObjectWithReactJson={true}
          jsonSrc={radioValue === "new" ? currentFieldData : initialValue}
          showArrayTitle={false}
        />
      )}
    </div>
  );
};

export default DropBoxJsonSelect;
