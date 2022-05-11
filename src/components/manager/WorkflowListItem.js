import React from "react";
import PropTypes from "prop-types";

import { Icon, List, Tag } from "antd";

import { nop } from "../../utils/misc";
import { workflowPropTypesShape } from "../../propTypes";

const TYPE_TAG_DISPLAY = {
    file: {
        color: "volcano",
        icon: "file",
    },
    enum: {
        color: "blue",
        icon: "menu",
    },
    number: {
        // TODO: Break into int and float?
        color: "green",
        icon: "number",
    },
    string: {
        color: "purple",
        icon: "font-size",
    },
};

const ioTagWithType = (id, ioType, typeContent = "") => (
    <Tag
        key={id}
        color={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].color}
        style={{ marginBottom: "2px" }}
    >
        <Icon type={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].icon} />
        &nbsp;
        {id} ({typeContent || ioType}
        {ioType.endsWith("[]") ? " array" : ""})
    </Tag>
);

const WorkflowListItem = ({ workflow, selectable, onClick }) => {
    const typeTag = <Tag key={workflow.data_type}>{workflow.data_type}</Tag>;

    const inputs = workflow.inputs.map((i) =>
        ioTagWithType(
            i.id,
            i.type,
            i.type.startsWith("file") ? i.extensions.join(" / ") : ""
        )
    );

    const inputExtensions = Object.fromEntries(
        workflow.inputs
            .filter((i) => i.type.startsWith("file"))
            .map((i) => [i.id, i.extensions[0]])
    ); // TODO: What to do with more than one?

    const outputs = workflow.outputs.map((o) => {
        if (!o.value)
            console.error(
                "Missing or invalid value prop for workflow output: ",
                o
            );

        if (!o.type.startsWith("file")) return ioTagWithType(o.id, o.type);

        const outputValue = o.value || "";
        let formattedOutput = outputValue;

        [...outputValue.matchAll(/{(.*)}/g)].forEach(([_, id]) => {
            formattedOutput = formattedOutput.replace(
                `{${id}}`,
                {
                    ...inputExtensions,
                    "": o.hasOwnProperty("map_from_input")
                        ? inputExtensions[o.map_from_input]
                        : undefined,
                }[id]
            );
        });

        return ioTagWithType(o.id, o.type, formattedOutput);
    });

    return (
        <List.Item>
            <List.Item.Meta
                title={
                    selectable ? (
                        <a onClick={() => (onClick || nop)()}>
                            {typeTag} {workflow.name}
                            <Icon
                                type="right"
                                style={{ marginLeft: "0.3rem" }}
                            />
                        </a>
                    ) : (
                        <span>
                            {typeTag} {workflow.name}
                        </span>
                    )
                }
                description={workflow.description || ""}
            />

            <div style={{ marginBottom: "12px" }}>
                <span style={{ fontWeight: "bold", marginRight: "1em" }}>
                    Inputs:
                </span>
                {inputs}
            </div>

            <div>
                <span style={{ fontWeight: "bold", marginRight: "1em" }}>
                    Outputs:
                </span>
                {outputs}
            </div>
        </List.Item>
    );
};

WorkflowListItem.propTypes = {
    workflow: workflowPropTypesShape,
    selectable: PropTypes.bool,
    onClick: PropTypes.func,
};

export default WorkflowListItem;
