import React, {Component} from "react";
import PropTypes from "prop-types";

import {connect} from "react-redux";

import {Form, Input, Select} from "antd";


// TODO: Load available data types from store

class TableForm extends Component {
    render() {
        const dataTypeOptions = this.props.dataTypes.map(dts =>
            <Select.Option key={`${dts.serviceKind}:${dts.dataType.id}`}>{dts.dataType.id}</Select.Option>);

        return <Form style={this.props.style || {}}>
            <Form.Item label="Name">
                {this.props.form.getFieldDecorator("name", {
                    initialValue: this.props.initialValue?.name || "",
                    rules: [{required: true}, {min: 3}]
                })(<Input placeholder="My Variant Dataset" size="large" />)}
            </Form.Item>
            <Form.Item label="Data Type">
                {this.props.form.getFieldDecorator("dataType", {
                    initialValue: this.props.initialValue?.dataType || null,
                    rules: [{required: true}]
                })(<Select style={{width: "100%"}}>{dataTypeOptions}</Select>)}
            </Form.Item>
        </Form>;
    }
}

TableForm.propTypes = {
    dataTypes: PropTypes.arrayOf(PropTypes.shape({
        dataType: PropTypes.object,  // TODO: Shape
        serviceKind: PropTypes.string,
    })),
    initialValue: PropTypes.shape({
        name: PropTypes.string,
        dataType: PropTypes.string,
    }),
    style: PropTypes.object,
};

const mapStateToProps = state => ({
    dataTypes: Object.entries(state.serviceDataTypes.dataTypesByServiceKind)
        .filter(([k, _]) => state.chordServices.itemsByKind[k]?.manageable_tables ?? false)
        .flatMap(([serviceKind, dts]) =>
            (dts.items || []).map(dataType => ({dataType, serviceKind}))),
});

export default connect(mapStateToProps, null, null, {forwardRef: true})(
    Form.create({name: "table_form"})(TableForm));
