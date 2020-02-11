import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Modal} from "antd";
import "antd/es/modal/style/css";

import LinkedFieldSetForm from "./LinkedFieldSetForm";

import {
    addDatasetLinkedFieldSetIfPossible,
    saveDatasetLinkedFieldSetIfPossible
} from "../../../../../modules/metadata/actions";

import {
    datasetPropTypesShape,
    linkedFieldSetPropTypesShape,
    nop,

    FORM_MODE_ADD,
    propTypesFormMode
} from "../../../../../utils";


class LinkedFieldSetModal extends Component {
    constructor(props) {
        super(props);
        this.form = null;
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        const mode = this.props.mode || FORM_MODE_ADD;

        this.form.validateFields(async (err, values) => {
            if (err) return;
            const newLinkedFieldSet = {
                name: values.name,
                fields: Object.fromEntries(values.fields.map(f => {
                    const parts = f.selected.split(".").slice(1);  // TODO: Condense this with filter (_, i)
                    return [parts[0], parts.slice(2)];
                }))
            };

            const onSuccess = async () => {
                if (this.props.onSubmit) await this.props.onSubmit();
                this.form.resetFields();
            };

            if (mode === FORM_MODE_ADD) {
                await this.props.addLinkedFieldSet(newLinkedFieldSet, onSuccess);
            } else {
                await this.props.saveLinkedFieldSet(newLinkedFieldSet, onSuccess);
            }
        });
    }

    render() {
        const mode = this.props.mode || FORM_MODE_ADD;

        const modalTitle = mode === FORM_MODE_ADD
            ? `Add New Linked Field Set to Dataset "${this.props.dataset.title}"`
            : `Edit Linked Field Set "${(this.props.linkedFieldSet || {}).name || ""}" on Dataset "${
                this.props.dataset.title}"`;

        return (
            <Modal title={modalTitle}
                   visible={this.props.visible}
                   confirmLoading={this.props.isSavingDataset}
                   width={768}
                   onOk={() => this.handleSubmit()}
                   onCancel={() => (this.props.onCancel || nop)()}>
                <LinkedFieldSetForm dataTypes={this.props.dataTypes}
                                    initialValue={this.props.linkedFieldSet || null}
                                    mode={this.props.mode}
                                    ref={form => this.form = form} />
            </Modal>
        );
    }
}

LinkedFieldSetModal.propTypes = {
    mode: propTypesFormMode,
    visible: PropTypes.bool,
    dataset: datasetPropTypesShape,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,

    // For editing
    linkedFieldSetIndex: PropTypes.number,
    linkedFieldSet: linkedFieldSetPropTypesShape,

    dataTypes: PropTypes.object,  // TODO: shape
    addLinkedFieldSet: PropTypes.func,
};

const mapStateToProps = state => ({
    dataTypes: state.serviceDataTypes.itemsByID,
    isSavingDataset: state.projects.isSavingDataset,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addLinkedFieldSet: async (newLinkedFieldSet, onSuccess) =>
        await dispatch(addDatasetLinkedFieldSetIfPossible(ownProps.dataset, newLinkedFieldSet, onSuccess)),
    saveLinkedFieldSet: async (linkedFieldSet, onSuccess) =>
        await dispatch(saveDatasetLinkedFieldSetIfPossible(ownProps.dataset, ownProps.linkedFieldSetIndex,
            linkedFieldSet, onSuccess)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedFieldSetModal);
