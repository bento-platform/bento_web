import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Form, Input } from "antd";
import DropBoxTreeSelect from "../DropBoxTreeSelect";
import { BENTO_DROP_BOX_FS_BASE_PATH } from "@/config";
import { testFileAgainstPattern } from "@/utils/files";
import JsonDisplay from "@/components/display/JsonDisplay";
import { useDropBoxFileContent } from "@/hooks";

const dropBoxTreeNodeEnabledJson = ({ name, contents }) =>
    contents !== undefined || testFileAgainstPattern(name, "^.*\.json$");

const ProjectForm = ({ form, style, initialValues, updateMode }) => {
    // Drop box discovery selection
    const discoveryFilePath = Form.useWatch('discoveryPath', form);
    const discoveryFileData = useDropBoxFileContent(discoveryFilePath);

    const currentDiscoveryData = discoveryFileData || initialValues?.discovery;

    // Indicate if updated
    const discoveryLabel = (updateMode && discoveryFileData)
        ? "New discovery config"
        : "Discovery config";

    useEffect(() => {
        if (currentDiscoveryData) {
            form.setFieldValue("discovery", currentDiscoveryData);
        }
    }, [form, currentDiscoveryData]);

    return <Form form={form} style={style || {}} layout="vertical" initialValues={initialValues}>
        <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true }, { min: 3 }]}
        >
            <Input placeholder="My Health Data Project" size="large" />
        </Form.Item>
        <Form.Item
            label="Description"
            name="description"
        >
            <Input.TextArea placeholder="Description" rows={3} />
        </Form.Item>
        <Form.Item
            label="Public Discovery Configuration"
        >
            <Form.Item
                label="Config file"
                name="discoveryPath"
            >
                <DropBoxTreeSelect
                    key={"discovery-select"}
                    basePrefix={BENTO_DROP_BOX_FS_BASE_PATH}
                    multiple={false}
                    nodeEnabled={dropBoxTreeNodeEnabledJson}
                />
            </Form.Item>
            <Form.Item
                label={discoveryLabel}
                name="discovery"
            >
                {/* TODO: form validation with discovery JSON-schema */}
                <JsonDisplay showObjectWithReactJson jsonSrc={currentDiscoveryData} />
            </Form.Item>
        </Form.Item>
    </Form>
};

ProjectForm.propTypes = {
    form: PropTypes.object,
    style: PropTypes.object,
    initialValues: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        discovery: PropTypes.object,
    }),
    discoveryContent: PropTypes.object,
    updateMode: PropTypes.bool,
};

export default ProjectForm;
