import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";
import "antd/es/typography/style/css";

import {toggleProjectDeletionModal} from "../../../modules/manager/actions";
import {deleteProjectIfPossible} from "../../../modules/metadata/actions";

import {projectPropTypesShape} from "../../../utils";


class ProjectDeletionModal extends Component {
    componentDidMount() {
        this.handleDeleteCancel = this.handleDeleteCancel.bind(this);
        this.handleDeleteSubmit = this.handleDeleteSubmit.bind(this);
    }

    handleDeleteCancel() {
        this.props.toggleProjectDeletionModal();
    }

    async handleDeleteSubmit() {
        await this.props.deleteProject(this.props.project);

        // TODO: Only close modal if deletion was a success
        this.props.toggleProjectDeletionModal();
    }

    render() {
        return (
            <Modal visible={this.props.showDeletionModal}
                   title={`Are you sure you want to delete the "${(this.props.project || {title: ""}).title}" project?`}
                   footer={[
                       <Button key="cancel" onClick={this.handleDeleteCancel}>Cancel</Button>,
                       <Button key="confirm" icon="delete" type="danger" onClick={this.handleDeleteSubmit}
                               loading={this.props.isDeletingProject}>Delete</Button>
                   ]}
                   onCancel={this.handleDeleteCancel}>
                <Typography.Paragraph>
                    Deleting this project means all data contained in the project will be deleted permanently, and
                    datasets will no longer be available for discovery within the CHORD federation.
                    {/* TODO: Real terms and conditions */}
                </Typography.Paragraph>
            </Modal>
        )
    }
}

ProjectDeletionModal.propTypes = {
    project: projectPropTypesShape,

    showDeletionModal: PropTypes.bool,
    isDeletingProject: PropTypes.bool,

    toggleProjectDeletionModal: PropTypes.func,
    deleteProject: PropTypes.func
};

const mapStateToProps = state => ({
    showDeletionModal: state.manager.projectDeletionModal,
    isDeletingProject: state.projects.isDeleting,
});

const mapDispatchToProps = dispatch => ({
    toggleProjectDeletionModal: () => dispatch(toggleProjectDeletionModal()),
    deleteProject: async project => await dispatch(deleteProjectIfPossible(project)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDeletionModal);
