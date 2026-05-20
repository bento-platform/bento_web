import { useEffect, useState } from "react";
import { Alert, Button, Collapse } from "antd";

import { useDropBoxJsonContent } from "@/modules/dropBox/hooks";
import { useDiscoveryValidator } from "@/modules/metadata/hooks";
import { dropBoxTreeNodeEnabledJson } from "@/utils/files";
import type { JSONType } from "@/types/json";
import DropBoxTreeSelect from "@/components/manager/dropBox/DropBoxTreeSelect";
import JsonDisplay from "@/components/display/JsonDisplay";

type DiscoveryFileSelectProps = {
  value?: JSONType;
  onChange?: (value: JSONType | undefined) => void;
};

const DiscoveryFileSelect = ({ value, onChange }: DiscoveryFileSelectProps) => {
  const [selectedPath, setSelectedPath] = useState<string | undefined>(undefined);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [jsonContent, jsonParseError] = useDropBoxJsonContent(selectedPath);
  const validateDiscovery = useDiscoveryValidator();
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInteracted) return;

    if (!selectedPath) {
      setValidationError(null);
      onChange?.(undefined);
      return;
    }
    if (jsonParseError) {
      setValidationError(`File is not valid JSON: ${jsonParseError}`);
      return;
    }
    if (jsonContent === null) {
      setValidationError(null);
      return;
    }
    validateDiscovery(null, jsonContent)
      .then(() => setValidationError(null))
      .catch((e: Error) => setValidationError(e.message))
      .finally(() => onChange?.(jsonContent));
  }, [hasInteracted, selectedPath, jsonContent, jsonParseError, validateDiscovery, onChange]);

  const displayedJson: JSONType | null = selectedPath ? jsonContent : (value ?? null);
  const showJson = displayedJson !== null && typeof displayedJson === "object";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <DropBoxTreeSelect
        nodeEnabled={dropBoxTreeNodeEnabledJson}
        allowClear
        value={selectedPath}
        onChange={(v) => {
          setHasInteracted(true);
          setSelectedPath(v as string | undefined);
        }}
        style={{ width: "100%" }}
        placeholder={
          value && !selectedPath ? "Existing value — select file to replace" : "Select a discovery config JSON file"
        }
      />
      {validationError && (
        <Alert type="error" showIcon message="Discovery config invalid" description={validationError} />
      )}
      {showJson && (
        <Collapse
          size="small"
          items={[
            {
              key: "json",
              label: selectedPath ? "Selected file contents" : "Current config",
              children: <JsonDisplay jsonSrc={displayedJson} showObjectWithReactJson={true} />,
              extra: !selectedPath && (
                <Button
                  size="small"
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasInteracted(true);
                    onChange?.(undefined);
                  }}
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default DiscoveryFileSelect;
