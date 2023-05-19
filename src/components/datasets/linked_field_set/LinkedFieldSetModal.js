import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Modal} from "antd";

import LinkedFieldSetForm from "./LinkedFieldSetForm";

import {
    addDatasetLinkedFieldSetIfPossible,
    saveDatasetLinkedFieldSetIfPossible,
} from "../../../modules/metadata/actions";

import {nop} from "../../../utils/misc";
import {FORM_MODE_ADD} from "../../../constants";
import {datasetPropTypesShape, linkedFieldSetPropTypesShape, propTypesFormMode} from "../../../propTypes";


class LinkedFieldSetModal extends Component {
    constructor(props) {
        super(props);
        this.form = null;
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        const mode = this.props.mode || FORM_MODE_ADD;

        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error("Encountered error validating fields", err);
                return;
            }

            console.log("Field set form values", values);

            const newLinkedFieldSet = {
                name: values.name,
                fields: Object.fromEntries(values.fields.map(f => {
                    const parts = f.selected.split(".").slice(1);  // TODO: Condense this with filter (_, i)
                    const entry = [parts[0], parts.slice(2)];
                    console.log("Linked field set entry", entry);
                    return entry;
                })),
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
        const mode = this.props.mode ?? FORM_MODE_ADD;

        const modalTitle = mode === FORM_MODE_ADD
            ? `Add New Linked Field Set to Dataset "${this.props.dataset.title}"`
            : `Edit Linked Field Set "${this.props.linkedFieldSet?.name ?? ""}" on Dataset "${
                this.props.dataset.title}"`;

        return (
            <Modal title={modalTitle}
                   visible={this.props.visible}
                   confirmLoading={this.props.isSavingDataset}
                   width={768}
                   onOk={() => this.handleSubmit()}
                   onCancel={() => (this.props.onCancel ?? nop)()}>
                <LinkedFieldSetForm dataTypes={this.props.dataTypes}
                                    initialValue={this.props.linkedFieldSet ?? null}
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
    isSavingDataset: PropTypes.bool,

    addLinkedFieldSet: PropTypes.func,
    saveLinkedFieldSet: PropTypes.func,
};

const mapStateToProps = state => ({
    dataTypes: state.serviceDataTypes.itemsByID,
    isSavingDataset: state.projects.isSavingDataset,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addLinkedFieldSet: (newLinkedFieldSet, onSuccess) =>
        dispatch(addDatasetLinkedFieldSetIfPossible(ownProps.dataset, newLinkedFieldSet, onSuccess)),
    saveLinkedFieldSet: (linkedFieldSet, onSuccess) =>
        dispatch(saveDatasetLinkedFieldSetIfPossible(ownProps.dataset, ownProps.linkedFieldSetIndex, linkedFieldSet,
            onSuccess)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedFieldSetModal);
