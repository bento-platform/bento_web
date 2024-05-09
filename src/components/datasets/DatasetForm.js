import React from "react";
import PropTypes from "prop-types";

import { Form, Input } from "antd";
const { Item } = Form;

import DataUseInput from "../DataUseInput";

import { DATA_USE_PROP_TYPE_SHAPE, INITIAL_DATA_USE_VALUE } from "@/duo";
import { simpleDeepCopy } from "@/utils/misc";
import { useDiscoveryValidator, useDropBoxFileContent } from "@/hooks";
import { DropBoxJsonSelect } from "../manager/DropBoxTreeSelect";
import { BENTO_DROP_BOX_FS_BASE_PATH } from "@/config";
import { dropBoxTreeNodeEnabledJson } from "@/utils/files";
import JsonDisplay from "../display/JsonDisplay";
import { Typography } from "../../../node_modules/antd/es/index";

const validateJson = (rule, value) => {
    try {
        JSON.parse(value);
        return Promise.resolve();
    } catch (e) {
        return Promise.reject("Please enter valid JSON");
    }
};

const DatasetForm = ({ initialValue, form, updateMode}) => {
    const discoveryValidator = useDiscoveryValidator();
    return (
        <Form form={form} layout="vertical" initialValues={initialValue}>
            <Item
                label="Title"
                name="title"
                // initialValue={initialValue?.title || ""}
                rules={[{ required: true }, { min: 3 }]}
            >
                <Input placeholder="My Dataset" size="large" />
            </Item>
            <Item
                label="Description"
                name="description"
                // initialValue={initialValue?.description || ""}
                rules={[{ required: true }]}
            >
                <Input.TextArea placeholder="This is a dataset" />
            </Item>
            <Item label="Contact Information" name="contact_info">
                <Input.TextArea placeholder={"Name\nInfo@c3g.ca"} />
            </Item>
            <DropBoxJsonSelect
                form={form}
                name="dats_file"
                initialValue={initialValue?.dats_file}
                labels={{
                    parent: "DATS",
                    select: "DATS file",
                    defaultContent: "DATS data",
                    updatedContent: updateMode ? "New DATS data" : "DATS data"
                }}
                rules={[{ required: true }, { validator: validateJson }, { min: 2 }]}
            />
            <DropBoxJsonSelect
                form={form}
                name="discovery"
                initialValue={initialValue?.discovery}
                labels={{
                    parent: "Public Discovery Configuration",
                    select: "Config file",
                    defaultContent: "Discovery config",
                    updatedContent: updateMode ? "New discovery config" : "Discovery config"
                }}
                rules={[{ validator: discoveryValidator}]}
            />
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
        discovery: PropTypes.object,
    }),
    form: PropTypes.object,
    updateMode: PropTypes.bool,
};

export default DatasetForm;
