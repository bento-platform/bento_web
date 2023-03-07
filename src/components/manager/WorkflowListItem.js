import React, {Component} from "react";
import PropTypes from "prop-types";

import {Icon, List, Tag} from "antd";


import {nop} from "../../utils/misc";
import {workflowPropTypesShape} from "../../propTypes";

const TYPE_TAG_DISPLAY = {
    file: {
        color: "volcano",
        icon: "file"
    },
    enum: {
        color: "blue",
        icon: "menu"
    },
    number: { // TODO: Break into int and float?
        color: "green",
        icon: "number"
    },
    string: {
        color: "purple",
        icon: "font-size"
    }
};

const ioTagWithType = (id, ioType, typeContent = "") => (
    <Tag key={id} color={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].color} style={{marginBottom: "2px"}}>
        <Icon type={TYPE_TAG_DISPLAY[ioType.replace("[]", "")].icon} />&nbsp;
        {id} ({typeContent || ioType}{ioType.endsWith("[]") ? " array" : ""})
    </Tag>
);

class WorkflowListItem extends Component {
    render() {
        const dt = this.props.workflow.data_type;
        const {inputs, outputs} = this.props.workflow;

        const typeTag = dt ? <Tag key={dt}>{dt}</Tag> : null;

        const inputTags = inputs.map(i =>
            ioTagWithType(i.id, i.type, i.type.startsWith("file") ? i.extensions.join(" / ") : ""));

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
                    "": o.hasOwnProperty("map_from_input") ? inputExtensions[o.map_from_input] : undefined
                }[id]);
            });

            return ioTagWithType(o.id, o.type, formattedOutput);
        });

        return <List.Item>
            <List.Item.Meta
                title={
                    this.props.selectable
                        ? <a onClick={() => (this.props.onClick || nop)()}>
                            {typeTag} {this.props.workflow.name}
                            <Icon type="right" style={{marginLeft: "0.3rem"}} /></a>
                        : <span>{typeTag} {this.props.workflow.name}</span>}
                description={this.props.workflow.description || ""} />

            <div style={{marginBottom: "12px"}}>
                <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
                {inputTags}
            </div>

            <div>
                <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>
                {outputTags}
            </div>
        </List.Item>;
    }
}

WorkflowListItem.propTypes = {
    workflow: workflowPropTypesShape,
    selectable: PropTypes.bool,
    onClick: PropTypes.func
};

export default WorkflowListItem;
