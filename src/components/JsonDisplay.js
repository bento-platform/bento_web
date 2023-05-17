import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Collapse, Select, Typography } from "antd";
import ReactJson from "react-json-view";

const { Panel } = Collapse;

// TODO: replace react-json-view with a maintained package.

const DEFAULT_REACT_JSON_OPTIONS = {
    "displayDataTypes": false,
    "enableClipboard": false,
    "name": false,
};

const JSON_ARRAY_GROUP_SIZE = 100;

const JsonArrayDisplay = ({ doc, standalone }) => {

    const [jsonArrayGroups, setJsonArrayGroups] = useState(null);
    const [selectedJsonGroup, setSelectedJsonGroup] = useState(null);

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
                key={selectedJsonGroup} // remount ReactJson with group change to force collapse
                src={src}
                collapsed={true}
                groupArraysAfterLength={JSON_ARRAY_GROUP_SIZE}
                {...DEFAULT_REACT_JSON_OPTIONS}
            />
        </>
    );
};

JsonArrayDisplay.propTypes = {
    doc: PropTypes.array,
    standalone: PropTypes.bool,
};

JsonArrayDisplay.defaultProps = {
    standalone: false,
};

const JsonPropertyDisplay = ({ keyName, value }) => {
    console.debug("JsonPropertyDisplay", value);
    if (Array.isArray(value) && value.length > 100) {
        // Display property as an array with custom nav
        return (<JsonArrayDisplay doc={value} />);
    }

    if (typeof value === "object") {
        // Display property as an object
        return (<ReactJson
            src={value}
            collapsed={true}
            {...DEFAULT_REACT_JSON_OPTIONS}
        />);
    }

    // Display primitive
    return (<ReactJson
        src={{[keyName]: value}}
        collapsed={false}
        {...DEFAULT_REACT_JSON_OPTIONS}
    />);
};

JsonPropertyDisplay.propTypes = {
    keyName: PropTypes.string,
    value: PropTypes.any,
};

const JsonObjectDisplay = ({ doc }) => {
    const entries = Object.entries(doc);
    return (
        <>
            <Typography.Title level={4}>JSON object</Typography.Title>
            <Collapse accordion>
                {entries.map(([key, value]) =>
                    <Panel header={key.toUpperCase()} key={key}>
                        <JsonPropertyDisplay keyName={key} value={value}/>
                    </Panel>
                )}
            </Collapse>
        </>
    );
};

JsonObjectDisplay.propTypes = {
    doc: PropTypes.object
};

const JsonDisplay = ({ jsonSrc }) => {
    if (Array.isArray(jsonSrc)) {
        // Special display for array nav
        console.log("ARRAY JSON");
        return (<JsonArrayDisplay doc={jsonSrc || []} standalone/>);
    }

    // Display for objects and primitives
    return (<JsonObjectDisplay doc={jsonSrc || {}}/>);
};

JsonDisplay.propTypes = {
    jsonSrc: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};

export default JsonDisplay;
