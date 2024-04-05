import React from "react";

import { Button, Popover, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import MonospaceText from "@/components/MonospaceText";


export const ROOT_SCHEMA_ID = "[dataset item]";
const ARRAY_ITEM_ID = "[item]";

const getFalse = () => false;


/**
 * Generates schema tree data and uses it to decide whether to include the current node in a searchable list fragment.
 * @param {object} node - The schema node to check.
 * @param {string} name - The node's ID (key fragment).
 * @param {string} prefix - The node's key prefix.
 * @param {function} isExcluded - A function determining if a key is disabled.
 * @returns {object[]} - An array with a tree node element for use in Ant Design components, or an empty array.
 */
const searchFragment = (node, name, prefix = "", isExcluded = getFalse) => {
    if (!node) return [];
    const result = generateSchemaTreeData(node, name, prefix, isExcluded);
    return (node.hasOwnProperty("search") || node.type === "object" && result.children.length > 0 ||
        node.type === "array" && result.children.length > 0) ? [result] : [];
};

/**
 * Sorts two object entries representing schema nodes.
 * @param {array} a - The first schema node entry.
 * @param {array} b - The second schema node entry.
 * @returns {number}
 */
const sortSchemaEntries = (a, b) => {
    if (a[1].hasOwnProperty("search") && b[1].hasOwnProperty("search")
        && a[1].search.hasOwnProperty("order") && b[1].search.hasOwnProperty("order")) {
        return a[1].search.order - b[1].search.order;
    }
    return a[0].localeCompare(b[0]);
};

/**
 * Generates a schema tree for Ant Design components by recursively descending into schema nodes.
 * @param {object} node - Current schema node.
 * @param {string} name - The node's ID (key fragment).
 * @param {string} prefix - The node's key prefix.
 * @param {function} isExcluded - A function determining if a key is disabled.
 * @returns {{children, selectable, disabled, titleSelected, title, value, key}} - Ant tree node for the schema node.
 */
export const generateSchemaTreeData = (
    node,
    name = ROOT_SCHEMA_ID,
    prefix = "",
    isExcluded = getFalse,
) => {
    const key = `${prefix}${name}`;
    const displayType = (node.type instanceof Array) ? node.type.join(" or ") : node.type;

    const selectable = node.hasOwnProperty("search")
        && node.search.hasOwnProperty("operations")
        && node.search.operations.length > 0
        && !isExcluded(key);

    let children = [];

    // Only include fields that are searchable, objects that have all searchable properties, and arrays that have items
    // that are searchable in some way. This is done using searchFragment, which returns [] if a node and all its
    // children are not searchable.
    switch (node.type) {
        case "object":
            children = Object.entries(node.properties ?? {})
                .sort(sortSchemaEntries)
                .flatMap(([name, node]) => searchFragment(node, name, `${key}.`, isExcluded));
            break;

        case "array":
            children = searchFragment(node.items, ARRAY_ITEM_ID, `${key}.`, isExcluded);
            break;
    }

    return {
        key,
        value: key,
        data: node,
        title: <span>
            <Typography.Text code>{name}</Typography.Text> - {displayType}
            {node.description ? (
                <Popover overlayStyle={{zIndex: 1051, maxWidth: "400px"}}
                         content={node.description}
                         title={<MonospaceText>
                             {key.replace(`${ROOT_SCHEMA_ID}.`, "")}
                         </MonospaceText>}>
                    <Button icon={<QuestionCircleOutlined />} type="link" size="small" style={{marginLeft: "8px"}}/>
                </Popover>
            ) : null}
        </span>,
        titleSelected: <Typography.Text style={{
            float: "right",
            fontFamily: "monospace",
            fontSize: "0.7rem",
            marginRight: "0.4rem",
        }}>{key.split(".").slice(1).join(".")}</Typography.Text>,
        selectable,
        disabled: !selectable && (!["object", "array"].includes(node.type)
            || children.filter(c => !c.disabled).length === 0),
        children,
    };
};

/**
 * Generates Ant-compatible table data from tree data.
 * @param {object} treeData - Tree data created via generateSchemaTreeData.
 * @returns {array} - List of table data to use as dataSource in an Ant table component.
 */
export const generateSchemaTableData = treeData =>
    [
        ...(treeData.key === ROOT_SCHEMA_ID
            ? []
            : [{
                ...Object.fromEntries(Object.entries(treeData).filter(p => p[0] !== "children")),
                key: treeData.key.replace(`${ROOT_SCHEMA_ID}.`, ""),
            }]),
        ...(treeData.children ?? []).flatMap(c => generateSchemaTableData(c)),
    ].sort((a, b) => a.key.localeCompare(b.key));

/**
 * Resolves a particular field's schema from the overall object schema and a dot-notation field string.
 * @param {object} schema - The overall schema for the data type.
 * @param {string} fieldString - String with dot notation representing the desired field.
 * @return {object} - Schema for the field.
 */
export const getFieldSchema = (schema, fieldString) => {
    const components = fieldString.split(".");
    if (components.length === 0 || components[0] !== ROOT_SCHEMA_ID) {
        // Field string doesn't correspond to the format mandated by the Bento front end.
        throw new Error("Invalid format for field string.");
    }

    let currentSchema = schema;
    let currentComponent = 0;
    while (currentComponent < components.length - 1) {
        switch (currentSchema.type) {
            case "object":
                currentComponent++;
                if (!currentSchema.hasOwnProperty("properties")
                        || !currentSchema.properties.hasOwnProperty(components[currentComponent])) {
                    throw new Error(`Invalid field specified in field string (missing property, at ${
                        components.slice(currentComponent)})`);
                }
                currentSchema = currentSchema.properties[components[currentComponent]];
                break;

            case "array":
                currentComponent++;
                if (!currentSchema.hasOwnProperty("items") || components[currentComponent] !== ARRAY_ITEM_ID) {
                    throw new Error(`Invalid field specified in field string (missing [item], at ${
                        components.slice(currentComponent)})`);
                }
                currentSchema = currentSchema.items;
                break;

            default:
                throw new Error("Cannot access properties of primitives.");
        }
    }

    return currentSchema;
};

/**
 * Gets all fields (in their dot-delimited key representation) from a schema.
 * @param {object} schema - The schema to extract keys from.
 * @returns {string[]} - An array of fields in dot-delimited key representation.
 */
export const getFields = schema => {
    // TODO: Deduplicate with tree select
    if (!schema) return [];
    const treeData = generateSchemaTreeData(schema, ROOT_SCHEMA_ID, "", getFalse);
    const getFieldsFromTreeData = (node, acc) => {
        acc.push(node.key);
        node.children.map(c => getFieldsFromTreeData(c, acc));
    };
    const acc = [];
    getFieldsFromTreeData(treeData, acc);
    return acc;
};
