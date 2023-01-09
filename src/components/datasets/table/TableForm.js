import React, {Component} from "react";
import PropTypes from "prop-types";

import {connect} from "react-redux";

import {Form, Input, Select} from "antd";


// TODO: Load available data types from store

class TableForm extends Component {
    render() {
        const dataTypeOptions = this.props.dataTypes.map(dts =>
            <Select.Option key={`${dts.a}:${dts.dt.id}`}>{dts.dt.id}</Select.Option>);

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
        dt: PropTypes.object,  // TODO: Shape
        a: PropTypes.string,
    })),
    initialValue: PropTypes.shape({
        name: PropTypes.string,
        dataType: PropTypes.string,
    }),
    style: PropTypes.object,
};

const mapStateToProps = state => ({
    dataTypes: Object.entries(state.serviceDataTypes.dataTypesByServiceArtifact)
        .filter(([a, _]) => (state.chordServices.itemsByArtifact[a] || {manageable_tables: false}).manageable_tables)
        .flatMap(([a, dts]) => (dts.items || []).map(dt => ({dt, a})))
});

export default connect(mapStateToProps, null, null, {forwardRef: true})(
    Form.create({name: "table_form"})(TableForm));
