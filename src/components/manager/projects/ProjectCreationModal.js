import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import ProjectForm from "./ProjectForm";

import {toggleProjectCreationModal} from "../../../modules/manager/actions";
import {createProjectIfPossible} from "../../../modules/metadata/actions";


class ProjectCreationModal extends Component {
    componentDidMount() {
        this.handleCreateCancel = this.handleCreateCancel.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    handleCreateCancel() {
        this.props.toggleProjectCreationModal();
    }

    handleCreateSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            await this.props.createProjectIfPossible(values, this.props.history);

            // TODO: Only clear values and close modal if submission was a success
            this.form.resetFields();
            this.props.toggleProjectCreationModal();
        });
    }

    render() {
        return <Modal visible={this.props.showCreationModal} title="Create Project" width={600} footer={[
            <Button key="cancel" onClick={this.handleCreateCancel}>Cancel</Button>,
            <Button key="create"
                    icon="plus"
                    type="primary"
                    onClick={this.handleCreateSubmit}
                    loading={this.props.isCreatingProject}>Create</Button>,
        ]} onCancel={this.handleCreateCancel}><ProjectForm ref={form => this.form = form} /></Modal>;
    }
}

ProjectCreationModal.propTypes = {
    showCreationModal: PropTypes.bool,
    isCreatingProject: PropTypes.bool,

    toggleProjectCreationModal: PropTypes.func,
    createProjectIfPossible: PropTypes.func,
};

const mapStateToProps = state => ({
    showCreationModal: state.manager.projectCreationModal,
    isCreatingProject: state.projects.isCreating,
});

export default withRouter(connect(mapStateToProps, {
    toggleProjectCreationModal,
    createProjectIfPossible,
})(ProjectCreationModal));
