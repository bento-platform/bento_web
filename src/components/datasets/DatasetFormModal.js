import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";


import DatasetForm from "./DatasetForm";

import {
    addProjectDataset,
    saveProjectDataset,
    fetchProjectsWithDatasetsAndTables,
} from "../../modules/metadata/actions";

import {nop} from "../../utils/misc";
import {FORM_MODE_ADD} from "../../constants";
import {datasetPropTypesShape, projectPropTypesShape, propTypesFormMode} from "../../propTypes";


class DatasetFormModal extends Component {
    componentDidMount() {
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
    }

    handleCancel() {
        (this.props.onCancel || nop)();
    }

    handleSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            const mode = this.props.mode || FORM_MODE_ADD;

            const onSuccess = async () => await this.handleSuccess(values);

            await (mode === FORM_MODE_ADD
                ? this.props.addProjectDataset(this.props.project, values, onSuccess)
                : this.props.saveProjectDataset({
                    ...(this.props.initialValue || {}),
                    project: this.props.project.identifier,
                    ...values,
                    description: (values.description || "").trim(),
                    contact_info: (values.contact_info || "").trim(),
                }, onSuccess));
        });
    }

    async handleSuccess(values) {
        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...
        await (this.props.onOk || nop)({...(this.props.initialValue || {}), values});
        if ((this.props.mode || FORM_MODE_ADD) === FORM_MODE_ADD) this.form.resetFields();
    }

    render() {
        const mode = this.props.mode || FORM_MODE_ADD;
        return this.props.project ? (
            <Modal visible={this.props.visible}
                   width={648}
                   title={mode === FORM_MODE_ADD
                       ? `Add Dataset to "${this.props.project.title}"`
                       : `Edit Dataset "${(this.props.initialValue || {}).title || ""}"`}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="save"
                               icon={mode === FORM_MODE_ADD ? "plus" : "save"}
                               type="primary"
                               onClick={this.handleSubmit}
                               loading={this.props.projectsFetching || this.props.projectDatasetsAdding ||
                                   this.props.projectDatasetsSaving || this.props.projectsFetchingWithTables}>
                           {mode === FORM_MODE_ADD ? "Add" : "Save"}
                       </Button>,
                   ]}
                   onCancel={this.handleCancel}>
                <DatasetForm ref={form => this.form = form}
                             initialValue={mode === FORM_MODE_ADD ? null : this.props.initialValue} />
            </Modal>
        ) : null;
    }
}

DatasetFormModal.propTypes = {
    mode: propTypesFormMode,
    initialValue: datasetPropTypesShape,

    onOk: PropTypes.func,
    onCancel: PropTypes.func,

    project: projectPropTypesShape,

    visible: PropTypes.bool,

    // From state

    projectsFetching: PropTypes.bool,
    projectDatasetsAdding: PropTypes.bool,
    projectDatasetsSaving: PropTypes.bool,
    projectsFetchingWithTables: PropTypes.bool,

    // From dispatch

    addProjectDataset: PropTypes.func,
    saveProjectDataset: PropTypes.func,
    fetchProjectsWithDatasetsAndTables: PropTypes.func,
};

const mapStateToProps = state => ({
    projectsFetching: state.projects.isFetching,
    projectDatasetsAdding: state.projects.isAddingDataset,
    projectDatasetsSaving: state.projects.isSavingDataset,
    projectsFetchingWithTables: state.projects.projectsFetchingWithTables,
});

export default connect(mapStateToProps, {
    addProjectDataset,
    saveProjectDataset,
    fetchProjectsWithDatasetsAndTables,
})(DatasetFormModal);
