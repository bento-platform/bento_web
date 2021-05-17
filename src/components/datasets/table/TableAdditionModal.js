import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Button, Modal} from "antd";

import TableForm from "./TableForm";

import {nop} from "../../../utils/misc";
import {datasetPropTypesShape, projectPropTypesShape} from "../../../propTypes";


const modalTitle = (dataset, project) =>
    `Add Table to Dataset "${(dataset || {}).title || ""}" (Project "${(project || {}).title || ""}")`;

class TableAdditionModal extends Component {
    componentDidMount() {
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            await (this.props.onSubmit || nop)(values);
            this.form.resetFields();
        });
    }

    render() {
        return (
            <Modal visible={this.props.visible}
                   title={modalTitle(this.props.dataset, this.props.project)}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="add"
                               icon="plus"
                               type="primary"
                               onClick={() => this.handleSubmit()}
                               loading={this.props.projectsFetchingWithTables ||
                                   this.props.projectTablesAdding || this.props.projectTablesFetching}>
                           Add
                       </Button>
                   ]}
                   onCancel={() => (this.props.onCancel || nop)()}>
                <TableForm ref={form => this.form = form} />
            </Modal>
        );
    }
}
TableAdditionModal.propTypes = {
    visible: PropTypes.bool,

    projectTablesAdding: PropTypes.bool,
    projectTablesFetching: PropTypes.bool,
    projectsFetchingWithTables: PropTypes.bool,

    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,

    onCancel: PropTypes.func,
    onSubmit: PropTypes.func
};

const mapStateToProps = state => ({
    projectTablesAdding: state.projectTables.isAdding,
    projectTablesFetching: state.projectTables.isFetching,
    projectsFetchingWithTables: state.projects.projectsFetchingWithTables,
});


export default connect(mapStateToProps)(TableAdditionModal);
