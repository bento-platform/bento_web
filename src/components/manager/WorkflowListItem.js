import { useMemo } from "react";
import PropTypes from "prop-types";

import { List, Tag } from "antd";
import {
  CheckSquareOutlined,
  DatabaseOutlined,
  FileOutlined,
  FolderOutlined,
  FontSizeOutlined,
  MenuOutlined,
  NumberOutlined,
  RightOutlined,
} from "@ant-design/icons";

import { workflowPropTypesShape } from "@/propTypes";
import { nop } from "@/utils/misc";

const TYPE_TAG_DISPLAY = {
  number: {
    color: "green",
    icon: <NumberOutlined />,
  },
  string: {
    color: "purple",
    icon: <FontSizeOutlined />,
  },
  boolean: {
    color: "cyan",
    icon: <CheckSquareOutlined />,
  },
  enum: {
    color: "blue",
    icon: <MenuOutlined />,
  },
  "project:dataset": {
    color: "magenta",
    icon: <DatabaseOutlined />,
  },
  file: {
    color: "volcano",
    icon: <FileOutlined />,
  },
  directory: {
    color: "orange",
    icon: <FolderOutlined />,
  },
};

const WorkflowInputTag = ({ id, type, children }) => {
  const display = useMemo(() => TYPE_TAG_DISPLAY[type.replace("[]", "")], [type]);
  return (
    <Tag key={id} color={display.color} style={{ marginBottom: "2px" }}>
      {display.icon}&nbsp;
      {id} ({children || type}
      {type.endsWith("[]") ? " array" : ""})
    </Tag>
  );
};
WorkflowInputTag.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node,
};

const FLEX_1 = { flex: 1 };
const MARGIN_RIGHT_1EM = { marginRight: "1em" };

const WorkflowListItem = ({ onClick, workflow, rightAlignedTags, style }) => {
  const { inputs, name, description, data_type: dt } = workflow;

  const typeTag = dt ? <Tag key={dt}>{dt}</Tag> : null;

  const inputTags = useMemo(
    () =>
      inputs
        .filter((i) => !i.hidden && !i.injected) // Filter out hidden/injected inputs
        .map(({ id, type, pattern }) => (
          <WorkflowInputTag key={id} id={id} type={type}>
            {type.startsWith("file") ? pattern ?? "" : ""}
          </WorkflowInputTag>
        )),
    [inputs],
  );

  const selectable = !!onClick; // Can be selected if a click handler exists

  const workflowNameStyle = rightAlignedTags ? FLEX_1 : MARGIN_RIGHT_1EM;

  return (
    <List.Item style={style}>
      <List.Item.Meta
        title={
          selectable ? (
            <a onClick={() => (onClick || nop)()} style={{ display: "flex" }}>
              <span style={workflowNameStyle}>
                {name}
                <RightOutlined style={{ marginLeft: "0.3rem" }} />
              </span>
              <span>{typeTag}</span>
            </a>
          ) : (
            <span style={{ display: "flex" }}>
              <span style={workflowNameStyle}>{name}</span>
              <span>{typeTag}</span>
            </span>
          )
        }
        description={description || ""}
      />

      <div style={{ marginBottom: "12px" }}>
        <span style={{ fontWeight: "bold", marginRight: "1em" }}>Inputs:</span>
        {inputTags}
      </div>

      {/* TODO: parse outputs from WDL. For now, we cannot list them, so we just don't show anything */}
      {/*<div>*/}
      {/*    <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>*/}
      {/*    {outputTags}*/}
      {/*</div>*/}
    </List.Item>
  );
};

WorkflowListItem.propTypes = {
  workflow: workflowPropTypesShape,
  selectable: PropTypes.bool,
  onClick: PropTypes.func,
  rightAlignedTags: PropTypes.bool,
  style: PropTypes.object,
};

export default WorkflowListItem;
