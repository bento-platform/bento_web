import React from "react";
import PropTypes from "prop-types";

import { Form, Input } from "antd";
const { Item } = Form;

import DataUseInput from "../DataUseInput";

import { DATA_USE_PROP_TYPE_SHAPE, INITIAL_DATA_USE_VALUE } from "../../duo";
import { simpleDeepCopy } from "../../utils/misc";

const validateJson = (rule, value, callback) => {
    try {
        JSON.parse(value);
        callback();
    } catch (e) {
        callback("Please enter valid JSON");
    }
};

const DatasetForm = ({ initialValue, formRef }) => {
    return (
        <Form ref={formRef} layout="vertical">
            <Item
                label="Title"
                name="title"
                initialValue={initialValue?.title || ""}
                rules={[{ required: true }, { min: 3 }]}
            >
                <Input placeholder="My Dataset" size="large" />
            </Item>
            <Item
                label="Description"
                name="description"
                initialValue={initialValue?.description || ""}
                rules={[{ required: true }]}
            >
                <Input.TextArea placeholder="This is a dataset" />
            </Item>
            <Item label="Contact Information" name="contact_info" initialValue={initialValue?.contact_info ?? ""}>
                <Input.TextArea placeholder={"Name\nInfo@c3g.ca"} />
            </Item>
            <Item
                label="DATS File"
                name="dats_file"
                initialValue={
                    initialValue?.dats_file ? JSON.stringify(initialValue.dats_file, null, 2) : ""
                }
                rules={[{ required: true }, { validator: validateJson }, { min: 2 }]}
            >
                <Input.TextArea />
            </Item>
            <Item
                label="Consent Code and Data Use Requirements"
                name="data_use"
                initialValue={initialValue?.data_use ?? simpleDeepCopy(INITIAL_DATA_USE_VALUE)}
                rules={[
                    { required: true },
                    (rule, value, callback) => {
                        if (!(value.consent_code || {}).primary_category) {
                            callback(["Please specify one primary consent code"]);
                            return;
                        }
                        callback([]);
                    },
                ]}
            >
                <DataUseInput />
            </Item>
        </Form>
    );
};

DatasetForm.propTypes = {
    initialValue: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        contact_info: PropTypes.string,
        data_use: DATA_USE_PROP_TYPE_SHAPE, // TODO: Shared shape for data use
        dats_file: PropTypes.object,
    }),
    formRef: PropTypes.object,
};

export default DatasetForm;
