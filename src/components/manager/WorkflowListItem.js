import React from "react";
import PropTypes from "prop-types";

import {Icon, List, Tag} from "antd";

import {nop} from "../../utils/misc";
import {workflowPropTypesShape} from "../../propTypes";

const TYPE_TAG_DISPLAY = {
    file: {
        color: "volcano",
        icon: "file",
    },
    enum: {
        color: "blue",
        icon: "menu",
    },
    number: { // TODO: Break into int and float?
        color: "green",
        icon: "number",
    },
    string: {
        color: "purple",
        icon: "font-size",
    },
};

const ioTagWithType = (id, ioType, typeContent = "") => (
    <Tag key={id} color={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].color} style={{marginBottom: "2px"}}>
        <Icon type={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].icon} />&nbsp;
        {id} ({typeContent || ioType}{ioType.endsWith("[]") ? " array" : ""})
    </Tag>
);

const WorkflowListItem = ({onClick, workflow}) => {
    const {inputs, outputs, name, description, data_type: dt} = workflow;

    const typeTag = dt ? <Tag key={dt}>{dt}</Tag> : null;

    const inputTags = inputs
        .filter(i => !i.hidden)  // Filter out hidden (often injected/FROM_CONFIG) inputs
        .map(i => ioTagWithType(i.id, i.type, i.type.startsWith("file") ? i.extensions.join(" / ") : ""));

    const inputExtensions = Object.fromEntries(inputs
        .filter(i => i.type.startsWith("file"))
        .map(i => [i.id, i.extensions[0]]));  // TODO: What to do with more than one?

    const outputTags = outputs.map(o => {
        if (!o.value) console.error("Missing or invalid value prop for workflow output: ", o);

        if (!o.type.startsWith("file")) return ioTagWithType(o.id, o.type);

        const outputValue = o.value || "";
        let formattedOutput = outputValue;

        [...outputValue.matchAll(/{(.*)}/g)].forEach(([_, id]) => {
            formattedOutput = formattedOutput.replace(`{${id}}`, {
                ...inputExtensions,
                "": o.hasOwnProperty("map_from_input") ? inputExtensions[o.map_from_input] : undefined,
            }[id]);
        });

        return ioTagWithType(o.id, o.type, formattedOutput);
    });

    const selectable = !!onClick;  // Can be selected if a click handler exists

    return <List.Item>
        <List.Item.Meta
            title={selectable
                ? <a onClick={() => (onClick || nop)()}>
                    {typeTag} {name}
                    <Icon type="right" style={{marginLeft: "0.3rem"}} /></a>
                : <span>{typeTag} {name}</span>}
            description={description || ""}
        />

        <div style={{marginBottom: "12px"}}>
            <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
            {inputTags}
        </div>

        <div>
            <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>
            {outputTags}
        </div>
    </List.Item>;
};

WorkflowListItem.propTypes = {
    workflow: workflowPropTypesShape,
    selectable: PropTypes.bool,
    onClick: PropTypes.func,
};

export default WorkflowListItem;
