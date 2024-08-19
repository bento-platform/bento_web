import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Card, Descriptions, Modal, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import JsonView from "@/components/common/JsonView";
import { deleteProjectJsonSchema } from "@/modules/metadata/actions";
import { projectJsonSchemaTypesShape } from "@/propTypes";

// Custom style based on Typography.Text in 'code' mode, with colors for dark backgrounds
const CODE_STYLE = {
  margin: "0 0.2em",
  padding: "0.2em 0.4em 0.1em",
  fontSize: "85%",
  fontFamily: "monospace",
  background: "rgba(0, 0, 0, 0.06)",
  border: "1px solid",
  borderColor: "white",
  color: "white",
  borderRadius: "3px",
};

export const ExtraPropertiesCode = ({ tooltip }) => {
  if (tooltip) {
    return <span style={CODE_STYLE}>extra_properties</span>;
  }
  return <Typography.Text code>extra_properties</Typography.Text>;
};

ExtraPropertiesCode.propTypes = {
  tooltip: PropTypes.bool,
};

ExtraPropertiesCode.defaultProps = {
  tooltip: false,
};

const ProjectJsonSchema = ({ projectSchema }) => {
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    const deleteModal = Modal.confirm({
      title: `Are you sure you want to delete the "${projectSchema.schema_type}" project JSON schema?`,
      content: (
        <Typography.Paragraph>
          Doing so will mean that <ExtraPropertiesCode /> data validation will not be enforced for entities of type{" "}
          <strong>{projectSchema.schema_type}</strong> in project {projectSchema.project}.
        </Typography.Paragraph>
      ),
      width: 720,
      autoFocusButton: "cancel",
      okText: "Delete",
      okType: "danger",
      maskClosable: true,
      onOk: async () => {
        deleteModal.update({ okButtonProps: { loading: true } });
        await dispatch(deleteProjectJsonSchema(projectSchema));
        deleteModal.update({ okButtonProps: { loading: false } });
      },
    });
  }, [dispatch, projectSchema]);

  return (
    <Card
      key={projectSchema.id}
      title={projectSchema.schema_type}
      extra={
        <Button danger={true} icon={<DeleteOutlined />} onClick={handleDelete}>
          Delete
        </Button>
      }
    >
      <Descriptions layout="vertical" column={1} bordered>
        <Descriptions.Item label="Required">{projectSchema.required ? "Yes" : "No"}</Descriptions.Item>

        <Descriptions.Item label="JSON Schema">
          <JsonView src={projectSchema.json_schema ?? {}} collapsed={true} />
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

ProjectJsonSchema.propTypes = {
  projectSchema: projectJsonSchemaTypesShape.isRequired,
};

export default ProjectJsonSchema;
