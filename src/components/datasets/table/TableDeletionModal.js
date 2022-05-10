import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Button, Modal, Typography } from "antd";

import { nop } from "../../../utils/misc";

// TODO: Replace with Modal.confirm
const TableDeletionModal = ({
    visible,
    table,
    isDeletingTable,
    onSubmit,
    onCancel,
}) => {
    return (
        <Modal
            visible={visible}
            title={`Are you sure you want to delete the "${
                (table || {}).name || ""
            }" table?`}
            footer={[
                <Button key="cancel" onClick={() => (onCancel || nop)()}>
                    Cancel
                </Button>,
                <Button
                    key="confirm"
                    icon="delete"
                    type="danger"
                    onClick={() => (onSubmit || nop)()}
                    loading={isDeletingTable}
                >
                    Delete
                </Button>,
            ]}
            onCancel={onCancel || nop}
        >
            <Typography.Paragraph>
                Deleting this table means all data contained in the table will
                be deleted permanently, and the will no longer be available for
                discovery within the current Bento federation.
                {/* TODO: Real terms and conditions */}
            </Typography.Paragraph>
        </Modal>
    );
};

TableDeletionModal.propTypes = {
    visible: PropTypes.bool,
    table: PropTypes.object,

    isDeletingTable: PropTypes.bool,

    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
};

const mapStateToProps = (state) => ({
    isDeletingTable:
        state.serviceTables.isDeleting || state.projectTables.isDeleting,
});

export default connect(mapStateToProps)(TableDeletionModal);
