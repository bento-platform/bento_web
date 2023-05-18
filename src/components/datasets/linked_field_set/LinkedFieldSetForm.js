import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Form, Icon, Input} from "antd";

import SchemaTreeSelect from "../../schema_trees/SchemaTreeSelect";
import {getFieldSchema} from "../../../utils/schema";
import {FORM_MODE_ADD, FORM_MODE_EDIT} from "../../../constants";
import {propTypesFormMode} from "../../../propTypes";

const FIELD_KEYS = "fieldKeys";
let fieldKey = 0;

class LinkedFieldSetForm extends Component {
    constructor(props) {
        super(props);
        this.addField = this.addField.bind(this);
        this.removeField = this.removeField.bind(this);
        this.syncForm = this.syncForm.bind(this);
        this.rootSchema = this.rootSchema.bind(this);
    }

    addField() {
        this.props.form.setFieldsValue({[FIELD_KEYS]: [...this.props.form.getFieldValue(FIELD_KEYS), fieldKey++]});
    }

    removeField(key) {
        this.props.form.setFieldsValue({
            [FIELD_KEYS]: this.props.form.getFieldValue(FIELD_KEYS).filter(k => k !== key),
        });
    }

    syncForm(prevProps = {}) {
        if (!prevProps.mode && this.props.mode) {
            if (this.props.mode === FORM_MODE_ADD) {
                this.addField();
                this.addField();
            }
        }

        if (JSON.stringify(prevProps.initialValue ?? {}) !==
                JSON.stringify(this.props.initialValue ?? {}) && this.props.mode === FORM_MODE_EDIT) {
            const initialValueObj = this.props.initialValue ?? {};
            fieldKey = Object.entries(initialValueObj.fields ?? {}).length;

            this.props.form.getFieldDecorator("name", {initialValue: initialValueObj.name ?? ""});
            this.props.form.setFieldsValue({[FIELD_KEYS]: [...(new Array(fieldKey)).keys()]});

            const rootSchema = this.rootSchema();

            Object.entries(initialValueObj.fields ?? {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([dt, f], i) => {
                    const selected = `[dataset item].${dt}.[item].${f.join(".")}`;
                    try {
                        this.props.form.getFieldDecorator(`fields[${i}]`, {
                            initialValue: {selected, schema: getFieldSchema(rootSchema, selected)},
                        });
                    } catch (err) {
                        // Possibly invalid field (due to migration / data model change), skip it.
                        console.log(`Encountered invalid field: ${selected}`);
                        console.error(err);
                    }
                });
        }
    }

    componentDidMount() {
        this.syncForm();
    }

    componentDidUpdate(prevProps, _prevState, _snapshot) {
        this.syncForm(prevProps);
    }

    rootSchema() {
        return {
            "type": "object",
            "properties": Object.fromEntries(Object.entries(this.props.dataTypes).map(([k, v]) => [k, {
                "type": "array",
                "items": v.schema,
            }])),
        };
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        const joinedSchema = this.rootSchema();

        // TODO: isExcluded
        // Initialize fieldKeys if needed  TODO: do this once?
        getFieldDecorator("fieldKeys", {initialValue: []});
        const fieldItems = getFieldValue(FIELD_KEYS).map((k, i) => (
            <Form.Item required={i < 2} key={k} label={`Field ${i + 1}`}>
                <Input.Group compact={true}>
                    {getFieldDecorator(`fields[${k}]`, {
                        rules: [{required: true, message: "Please specify a field"}],
                    })(<SchemaTreeSelect schema={joinedSchema} style={{width: "calc(100% - 33px)"}} /> )}
                    <Button icon="close" type="danger" disabled={i < 2} onClick={() => this.removeField(k)} />
                </Input.Group>
            </Form.Item>
        ));

        return <Form>
            <Form.Item label="Name">
                {getFieldDecorator("name", {
                    initialValue: this.props.initialValue?.name ?? "",
                    rules: [{required: true}, {min: 3}],
                })(<Input placeholder="Sample IDs" />)}
            </Form.Item>
            {fieldItems}
            <Form.Item>
                <Button type="dashed" onClick={() => this.addField()} block={true}>
                    <Icon type="plus" /> Add Linked Field
                </Button>
            </Form.Item>
        </Form>;
    }
}

LinkedFieldSetForm.propTypes = {
    mode: propTypesFormMode,
    dataTypes: PropTypes.objectOf(PropTypes.object),
    initialValue: PropTypes.shape({
        name: PropTypes.string,
        fields: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    }),
};

export default Form.create({name: "linked_field_set_form"})(LinkedFieldSetForm);
