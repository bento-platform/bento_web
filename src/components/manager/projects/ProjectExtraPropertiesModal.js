import { Button, Col, Empty, Modal, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { nop } from "@/utils/misc";
import ProjectJsonSchema from "@/components/manager/projects/ProjectJsonSchema";
import PropTypes from "prop-types";
const ProjectExtraPropertiesModal = ({ open, onCancel, loading, projectState, canEditProject, onAddJsonSchema }) => {
  return (
    <Modal
      title="Extra Properties JSON schemas"
      open={open}
      width={648}
      styles={{
        body: {
          overflowY: "auto",
          maxHeight: 800,
        },
      }}
      footer={[
        <Button
          key="create"
          icon={<PlusOutlined />}
          onClick={onAddJsonSchema || nop}
          loading={loading}
          disabled={!canEditProject}
        >
          Add JSON schema
        </Button>,
        <Button key={"ok"} type="primary" onClick={onCancel}>
          Ok
        </Button>,
      ]}
      onCancel={onCancel}
    >
      {projectState.project_schemas.length > 0 ? (
        projectState.project_schemas.map((pjs) => (
          <Row gutter={[0, 16]} key={pjs["id"]}>
            <Col span={24}>
              <ProjectJsonSchema projectSchema={pjs} />
            </Col>
          </Row>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No project JSON schemas" />
      )}
    </Modal>
  );
};

ProjectExtraPropertiesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  projectState: PropTypes.object.isRequired,
  canEditProject: PropTypes.bool.isRequired,
  onAddJsonSchema: PropTypes.func.isRequired,
};

export default ProjectExtraPropertiesModal;
