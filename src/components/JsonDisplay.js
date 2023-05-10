import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Collapse, Select, Typography } from "antd";
import ReactJson from "react-json-view";

const { Panel } = Collapse;

// TODO: replace react-json-view with a maintained package.

const JSON_PROP_TYPE = PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
]);

const JSON_ARRAY_GROUP_SIZE = 100;

const JsonArrayDisplay = ({ doc, standalone }) => {

    const [jsonArrayGroups, setJsonArrayGroups] = useState(null);
    const [selectedJsonGroup, setSelectedJsonGroup] = useState(null);

    // React re-mount hack
    // To get around ReactJson's lack of collapse control
    const [mountKey, setMountKey] = useState(0);

    useEffect(() => {
        if (Array.isArray(doc) && doc.length > JSON_ARRAY_GROUP_SIZE) {
            // Array group selector options
            const arrayGroups = {};
            for (let start = 0; start < doc.length; start += JSON_ARRAY_GROUP_SIZE) {
                const chunk = doc.slice(start, start + JSON_ARRAY_GROUP_SIZE);
                const next = start + JSON_ARRAY_GROUP_SIZE;
                const end = next > doc.length
                    ? doc.length
                    : next;
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

    useEffect(() => {
        setMountKey(mountKey + 1);
    }, [selectedJsonGroup]);

    const onJsonGroupSelect = useCallback((key) => {
        setSelectedJsonGroup(key);
    }, []);

    const shouldGroup = doc.length > JSON_ARRAY_GROUP_SIZE;

    // Wait for group slicing to avoid render flicker
    if (shouldGroup && !(jsonArrayGroups && selectedJsonGroup)) return <div />;

    const src = shouldGroup ? jsonArrayGroups[selectedJsonGroup] : doc;
    return (
        <>
            {standalone && <Typography.Title level={4}>JSON array</Typography.Title>}
            {shouldGroup &&
                <>
                    <Typography.Text>Grouped array items</Typography.Text>
                    <Select style={{ width: 120, padding: 5 }} onChange={onJsonGroupSelect} value={selectedJsonGroup}>
                        {Object.keys(jsonArrayGroups).map(key => (
                            <Select.Option key={key} value={key}>{key}</Select.Option>
                        ))}
                    </Select>
                </>
            }
            <ReactJson
                key={mountKey}
                src={src}
                displayDataTypes={false}
                enableClipboard={false}
                name={false}
                collapsed={true}
                groupArraysAfterLength={JSON_ARRAY_GROUP_SIZE}
            />
        </>
    );
};

JsonArrayDisplay.propTypes = {
    doc: JSON_PROP_TYPE,
    standalone: PropTypes.bool,
};

JsonArrayDisplay.defaultProps = {
    standalone: false,
};

const JsonPropertyDisplay = ({ value }) => {
    if (Array.isArray(value) && value.length > 100) {
        return (<JsonArrayDisplay doc={value} />);
    }

    return (<ReactJson
        src={value || {}}
        displayDataTypes={false}
        enableClipboard={false}
        name={false}
        collapsed={true}
    />);
};

JsonPropertyDisplay.propTypes = {
    value: JSON_PROP_TYPE,
};

const JsonObjectDisplay = ({ doc }) => {
    const entries = Object.entries(doc);
    return (
        <>
            <Typography.Title level={4}>JSON object</Typography.Title>
            <Collapse accordion>
                {entries.map(([key, value]) =>
                    <Panel header={key.toUpperCase()} key={key}>
                        <JsonPropertyDisplay value={value} />
                    </Panel>
                )}
            </Collapse>
        </>
    );
};

JsonObjectDisplay.propTypes = {
    doc: PropTypes.object
};

export { JsonArrayDisplay, JsonObjectDisplay };
