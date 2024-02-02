import React from "react";
import PropTypes from "prop-types";
import { Modal } from "antd";

import FileDisplay from "./FileDisplay";

const FileModal = ({ title, visible, onCancel, hasTriggered, url, fileName, loading }) => (
    <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        width="90vw"
        style={{
            // the flex display allows items which are less wide (e.g., portrait PDFs) to have a narrower modal
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            top: 50,  // down from default of 100; gives a bit more screen real estate
        }}
        bodyStyle={{
            minWidth: "692px",
            maxWidth: "90vw",  // needed, otherwise this ends up being more than the parent width for some reason
        }}
        footer={null}
        // destroyOnClose in order to stop audio/video from playing & avoid memory leaks at the cost of re-fetching:
        destroyOnClose={true}
    >
        {(hasTriggered ?? true) && (
            <FileDisplay uri={url} fileName={fileName} loading={loading ?? false} />
        )}
    </Modal>
);
FileModal.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    hasTriggered: PropTypes.bool,
    url: PropTypes.string,
    fileName: PropTypes.string,
    loading: PropTypes.bool,
};

export default FileModal;
