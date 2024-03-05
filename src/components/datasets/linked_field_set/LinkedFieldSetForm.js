import React, { useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";

import { Button, Form, Input } from "antd";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";

import SchemaTreeSelect from "../../schema_trees/SchemaTreeSelect";
import { FORM_MODE_ADD } from "@/constants";
import { propTypesFormMode } from "@/propTypes";
import { getFieldSchema } from "@/utils/schema";


const FORM_NAME_RULES = [{ required: true }, { min: 3 }];

const LinkedFieldSetForm = ({ form, dataTypes, initialValue, mode }) => {
    const itemAddRef = useRef(null);

    const rootSchema = useMemo(() => ({
        "type": "object",
        "properties": Object.fromEntries(Object.entries(dataTypes).map(([k, v]) => [k, {
            "type": "array",
            "items": v.schema,
        }])),
    }), [dataTypes]);

    useEffect(() => {
        form.resetFields();
    }, [initialValue]);

    const initialListValue = useMemo(
        () => mode === FORM_MODE_ADD
            ? [{}, {}]
            : Object.entries(initialValue?.fields ?? {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([dt, f]) => {
                    const selected = `[dataset item].${dt}.[item].${f.join(".")}`;
                    try {
                        return { selected, schema: getFieldSchema(rootSchema, selected) };
                    } catch (err) {
                        // Possibly invalid field (due to migration / data model change), skip it.
                        console.error(`Encountered invalid field: ${selected}`);
                        return null;
                    }
                })
                .filter((f) => f !== null),
        [mode, initialValue, rootSchema]);

    return (
        <Form form={form}>
            <Form.Item label="Name" name="name" initialValue={initialValue?.name ?? ""} rules={FORM_NAME_RULES}>
                <Input placeholder="Sample IDs" />
            </Form.Item>
            <Form.List name="fields" initialValue={initialListValue}>
                {(fields, { add, remove }) => {
                    itemAddRef.current = add;
                    return (
                        <>
                            {fields.map((field, i) => (
                                <Form.Item label={`Field ${i + 1}`} key={field.key} required={i < 2}>
                                    <Form.Item {...field} noStyle={true}>
                                        <SchemaTreeSelect
                                            schema={rootSchema}
                                            style={{ width: "calc(100% - 33px)" }}
                                        />
                                    </Form.Item>
                                    <Button
                                        icon={<CloseCircleOutlined />}
                                        type="link"
                                        danger={true}
                                        disabled={i < 2}
                                        style={{ cursor: i < 2 ? "not-allowed" : "pointer" }}
                                        onClick={() => remove(field.name)}
                                    />
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={add} icon={<PlusOutlined />} style={{ width: "100%" }}>
                                    Add Linked Field
                                </Button>
                            </Form.Item>
                        </>
                    );
                }}
            </Form.List>
        </Form>
    );
};

LinkedFieldSetForm.propTypes = {
    form: PropTypes.object,
    mode: propTypesFormMode,
    dataTypes: PropTypes.objectOf(PropTypes.object),
    initialValue: PropTypes.shape({
        name: PropTypes.string,
        fields: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    }),
};

export default LinkedFieldSetForm;
