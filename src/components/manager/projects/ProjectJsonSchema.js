import React, { useCallback } from "react";
import { projectJsonSchemaTypesShape } from "../../../propTypes";
import { Button, Card, Descriptions, Modal, Typography } from "antd";
import ReactJson from "react-json-view";
import { useDispatch } from "react-redux";
import { deleteProjectJsonSchema } from "../../../modules/metadata/actions";

const ProjectJsonSchema = ({ projectSchema }) => {

    const dispatch = useDispatch();

    const handleDelete = useCallback(() => {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${projectSchema.schema_type}" project JSON schema?`,
            content: <>
                <Typography.Paragraph>
                    Doing so will mean that extra_properties data validation will not be
                    enforced for entities of type <strong>{projectSchema.schema_type}</strong>
                    in project {projectSchema.project}
                </Typography.Paragraph>
            </>,
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
    }, [projectSchema]);

    return (
        <Card
            key={projectSchema.id}
            title={projectSchema.schema_type}
            extra={
                <Button type="danger" icon="delete" onClick={handleDelete}>Delete</Button>
            }
        >
            <Descriptions layout="vertical" column={1} bordered>
                <Descriptions.Item label="Required">
                    {projectSchema.required ? "Yes" : "No"}
                </Descriptions.Item>

                <Descriptions.Item label="JSON Schema">
                    <ReactJson
                        src={projectSchema.json_schema ?? {}}
                        collapsed={true}
                        displayDataTypes={false}
                        enableClipboard={false}
                        name={null}
                    />
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

ProjectJsonSchema.propTypes = {
    projectSchema: projectJsonSchemaTypesShape.isRequired,
};

export default ProjectJsonSchema;
