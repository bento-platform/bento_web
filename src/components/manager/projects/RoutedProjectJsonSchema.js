import React, { useEffect, useState } from "react";
import ProjectJsonSchemaModal from "./ProjectJsonSchemaModal";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { useSelector } from "react-redux";
import { Button, Col, Empty, Row, Typography } from "antd";
import ProjectJsonSchema from "./ProjectJsonSchema";

const RoutedProjectJsonSchema = () => {

    const { project } = useParams();

    const projectsByID = useSelector(state => state.projects.itemsByID);

    const [isModalVisible, setModalVisible] = useState(false);
    const [projectSchemas, setProjectSchemas] = useState([]);

    useEffect(() => {
        const selected = projectsByID[project];
        const schemas = selected.project_schemas;
        setProjectSchemas(schemas);
    }, [project, projectsByID]);

    return (<>
        <ProjectJsonSchemaModal projectId={project}
                                visible={isModalVisible}
                                onOk={() => setModalVisible(false)}
                                onCancel={() => setModalVisible(false)} />
        <Typography.Title level={4} style={{ marginTop: "1.2em" }}>
            Extra Properties JSON schemas
            <div style={{ float: "right" }}>
                <Button icon="plus"
                        style={{ verticalAlign: "top" }}
                        onClick={() => setModalVisible(true)}>
                    Add JSON schema
                </Button>
            </div>
        </Typography.Title>
        {projectSchemas.length > 0
            ? projectSchemas.map(pjs =>
                <Row gutter={[0, 16]} key={pjs["id"]}>
                    <Col span={24}>
                        <ProjectJsonSchema projectSchema={pjs} />
                    </Col>
                </Row>
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No project JSON schemas">
                    <Button icon="plus" onClick={() => setModalVisible(true)}>
                        Add JSON schema
                    </Button>
                </Empty>
            )
        }
    </>);
};

export default RoutedProjectJsonSchema;
