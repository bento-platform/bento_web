import { useCallback, useEffect, useState } from "react";
import { Collapse, Select, Typography } from "antd";

import JsonView from "@/components/common/JsonView";
import MonospaceText from "@/components/common/MonospaceText";
import type { JSONType } from "@/types/json";

const DEFAULT_JSON_VIEW_OPTIONS = {
  collapsed: true,
};

const JSON_ARRAY_GROUP_SIZE = 100;

type JsonArrayDisplayProps = {
  doc: JSONType[];
  standalone?: boolean;
};

const JsonArrayDisplay = ({ doc, standalone }: JsonArrayDisplayProps) => {
  const [jsonArrayGroups, setJsonArrayGroups] = useState<Record<string, JSONType[]> | null>(null);
  const [selectedJsonGroup, setSelectedJsonGroup] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(doc) && doc.length > JSON_ARRAY_GROUP_SIZE) {
      // Array group selector options
      const arrayGroups: Record<string, JSONType[]> = {};
      for (let start = 0; start < doc.length; start += JSON_ARRAY_GROUP_SIZE) {
        const chunk = doc.slice(start, start + JSON_ARRAY_GROUP_SIZE);
        const next = start + JSON_ARRAY_GROUP_SIZE;
        const end = next > doc.length ? doc.length : next;
        arrayGroups[`${start}-${end}`] = chunk;
      }
      const keys = Object.keys(arrayGroups);
      setJsonArrayGroups(arrayGroups);
      setSelectedJsonGroup(keys[0]);
    } else {
      setJsonArrayGroups(null);
      setSelectedJsonGroup(null);
    }
  }, [doc]);

  const onJsonGroupSelect = useCallback((key: string) => {
    setSelectedJsonGroup(key);
  }, []);

  const shouldGroup = doc.length > JSON_ARRAY_GROUP_SIZE;

  // Wait for group slicing to avoid render flicker
  if (shouldGroup && !(jsonArrayGroups && selectedJsonGroup)) return <div />;

  const src = jsonArrayGroups && selectedJsonGroup ? jsonArrayGroups[selectedJsonGroup] : doc;

  return (
    <>
      {standalone && <Typography.Title level={4}>JSON array</Typography.Title>}
      {shouldGroup && (
        <>
          <Typography.Text>Grouped array items</Typography.Text>
          <Select
            style={{ width: 120, padding: 5 }}
            onChange={onJsonGroupSelect}
            value={selectedJsonGroup}
            options={Object.keys(jsonArrayGroups ?? {}).map((value) => ({ value, label: value }))}
          />
        </>
      )}
      <JsonView
        key={selectedJsonGroup} // remount ReactJson with group change to force collapse
        src={src}
        collapseObjectsAfterLength={JSON_ARRAY_GROUP_SIZE}
        {...DEFAULT_JSON_VIEW_OPTIONS}
      />
    </>
  );
};

type JsonObjectDisplayProps = {
  doc: Record<string, JSONType>;
};

const JsonObjectDisplay = ({ doc }: JsonObjectDisplayProps) => {
  const entries = Object.entries(doc);
  return (
    <>
      <Typography.Title level={4}>JSON object</Typography.Title>
      <Collapse
        accordion={true}
        items={entries.map(([key, value]) => ({
          key,
          label: <MonospaceText>{key}</MonospaceText>,
          children: <JsonDisplay jsonSrc={value} showObjectWithReactJson={true} />,
        }))}
      />
    </>
  );
};

type JsonDisplayProps = {
  jsonSrc?: JSONType;
  showObjectWithReactJson?: boolean;
  showArrayTitle?: boolean;
};

const JsonDisplay = ({ jsonSrc, showObjectWithReactJson, showArrayTitle }: JsonDisplayProps) => {
  if (Array.isArray(jsonSrc)) {
    // Special display for array nav
    return <JsonArrayDisplay doc={jsonSrc || []} standalone={showArrayTitle ?? true} />;
  }

  if (jsonSrc === null) {
    return <MonospaceText>null</MonospaceText>;
  }

  if (typeof jsonSrc === "object") {
    // Display for objects
    return showObjectWithReactJson ? (
      <JsonView src={jsonSrc || {}} {...DEFAULT_JSON_VIEW_OPTIONS} />
    ) : (
      <JsonObjectDisplay doc={jsonSrc || {}} />
    );
  }

  // Display primitive
  return <MonospaceText>{JSON.stringify(jsonSrc)}</MonospaceText>;
};

export default JsonDisplay;
