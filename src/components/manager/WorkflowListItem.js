import React from "react";
import PropTypes from "prop-types";

import {Icon, List, Tag} from "antd";

import {nop} from "../../utils/misc";
import {workflowPropTypesShape} from "../../propTypes";

const TYPE_TAG_DISPLAY = {
    number: {
        color: "green",
        icon: "number",
    },
    string: {
        color: "purple",
        icon: "font-size",
    },
    boolean: {
        color: "cyan",
        icon: "check-square",
    },
    enum: {
        color: "blue",
        icon: "menu",
    },
    "project:dataset": {
        color: "magenta",
        icon: "database",
    },
    file: {
        color: "volcano",
        icon: "file",
    },
    directory: {
        color: "orange",
        icon: "folder",
    },
};

const ioTagWithType = (id, ioType, typeContent = "") => (
    <Tag key={id} color={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].color} style={{marginBottom: "2px"}}>
        <Icon type={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].icon} />&nbsp;
        {id} ({typeContent || ioType}{ioType.endsWith("[]") ? " array" : ""})
    </Tag>
);

const FLEX_1 = { flex: 1 };
const MARGIN_RIGHT_1EM = { marginRight: "1em" };

const WorkflowListItem = ({ onClick, workflow, rightAlignedTags }) => {
    const {inputs, name, description, data_type: dt} = workflow;

    const typeTag = dt ? <Tag key={dt}>{dt}</Tag> : null;

    const inputTags = inputs
        .filter(i => !i.hidden && !i.injected)  // Filter out hidden (often injected/FROM_CONFIG) inputs
        .map(i =>
            ioTagWithType(
                i.id,
                i.type,
                i.type.startsWith("file")
                    ? i.extensions ? (i.extensions.join(" / ")) : (i.pattern ?? "")
                    : "",
            ));

    const selectable = !!onClick;  // Can be selected if a click handler exists

    const workflowNameStyle = rightAlignedTags ? FLEX_1 : MARGIN_RIGHT_1EM;

    return <List.Item>
        <List.Item.Meta
            title={selectable
                ? <a onClick={() => (onClick || nop)()} style={{ display: "flex" }}>
                    <span style={workflowNameStyle}>
                        {name}
                        <Icon type="right" style={{marginLeft: "0.3rem"}} />
                    </span><span>{typeTag}</span></a>
                : <span style={{ display: "flex" }}>
                    <span style={workflowNameStyle}>{name}</span>
                    <span>{typeTag}</span>
                </span>}
            description={description || ""}
        />

        <div style={{marginBottom: "12px"}}>
            <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
            {inputTags}
        </div>

        {/* TODO: parse outputs from WDL. For now, we cannot list them, so we just don't show anything */}
        {/*<div>*/}
        {/*    <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>*/}
        {/*    {outputTags}*/}
        {/*</div>*/}
    </List.Item>;
};

WorkflowListItem.propTypes = {
    workflow: workflowPropTypesShape,
    selectable: PropTypes.bool,
    onClick: PropTypes.func,
    rightAlignedTags: PropTypes.bool,
};

export default WorkflowListItem;
