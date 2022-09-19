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

const DatasetForm = ({ style, initialValue, form }) => {
    return (
        <Form style={style || {}}>
            <Item label="Title">
                {form.getFieldDecorator("title", {
                    initialValue: initialValue?.title || "",
                    rules: [{ required: true }, { min: 3 }],
                })(<Input placeholder="My Dataset" size="large" />)}
            </Item>
            <Item label="Description">
                {form.getFieldDecorator("description", {
                    initialValue: initialValue?.description || "",
                    rules: [{ required: true }],
                })(<Input.TextArea placeholder="This is a dataset" />)}
            </Item>
            <Item label="Contact Information">
                {form.getFieldDecorator("contact_info", {
                    initialValue: initialValue?.contact_info || "",
                })(<Input.TextArea placeholder={"Name\nInfo@c3g.ca"} />)}
            </Item>
            <Item label="DATS File">
                {form.getFieldDecorator("dats_File", {
                    initialValue: initialValue?.dats_file || "",
                    rules: [{ validator: validateJson }],
                })(<Input.TextArea />)}
            </Item>
            <Item label="Consent Code and Data Use Requirements">
                {form.getFieldDecorator("data_use", {
                    initialValue:
                        (
                            initialValue || {
                                data_use: simpleDeepCopy(INITIAL_DATA_USE_VALUE),
                            }
                        ).data_use || simpleDeepCopy(INITIAL_DATA_USE_VALUE),
                    rules: [
                        { required: true },
                        (rule, value, callback) => {
                            if (!(value.consent_code || {}).primary_category) {
                                callback(["Please specify one primary consent code"]);
                                return;
                            }
                            callback([]);
                        },
                    ],
                })(<DataUseInput />)}
            </Item>
        </Form>
    );
};

DatasetForm.propTypes = {
    style: PropTypes.object,
    initialValue: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        contact_info: PropTypes.string,
        data_use: DATA_USE_PROP_TYPE_SHAPE, // TODO: Shared shape for data use
        dats_file: PropTypes.object,
    }),
};

export default Form.create({ name: "dataset_form" })(DatasetForm);
