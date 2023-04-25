import React from "react";
import {projectJsonSchemaTypesShape} from "../../../propTypes";
import {Button, Card, Col, Divider, Empty, Icon, Modal, Row, Typography, } from "antd";
import ReactJson from "react-json-view";

const ProjectJsonSchema = ({project_schema}) => {

    return (
        <Card
            key={project_schema.id}
            title={project_schema.schema_type}
            
        >
            <p>Required: {project_schema.required ?? false}</p>
            <ReactJson
                src={project_schema.json_schema ?? {}}
                displayDataTypes={false}                
                enableClipboard={false}
                name={null}
            />
        </Card>
    );
};

ProjectJsonSchema.prototype = {
    project_schema: projectJsonSchemaTypesShape
};

export default ProjectJsonSchema;
