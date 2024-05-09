import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Form, Input } from "antd";
import { DropBoxJsonSelect } from "../DropBoxTreeSelect";

const ProjectForm = ({ form, style, initialValues }) => {
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues]);
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
        <DropBoxJsonSelect
            form={form}
            name="discovery"
            labels={{
                parent: "Public Discovery Configuration",
                select: "Config file",
                defaultContent: "Discovery config",
                updatedContent: "New discovery config"
            }}
            initialValue={initialValues?.discovery}
        />
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
};

export default ProjectForm;
