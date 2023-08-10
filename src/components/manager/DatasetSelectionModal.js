import React, {useState} from "react";
import PropTypes from "prop-types";

import {Form, Modal} from "antd";

// import TableTreeSelect from "./TableTreeSelect";
import DatasetTreeSelect from "./DatasetTreeSelect";

import {nop} from "../../utils/misc";

const DatasetSelectionModal = ({dataType, title, visible, onCancel, onOk}) => {

    const [selectedProject, setSelectedProject] = useState(undefined);
    const [selectedDataset, setSelectedDataset] = useState(undefined);

    const onChangeInner = (project, dataset) => {
        setSelectedProject(project);
        setSelectedDataset(dataset);
    };

    return <Modal title={title || "Select a Dataset"}
                  visible={visible || false}
                  onCancel={() => (onCancel || nop)()}
                  onOk={() => (onOk || nop)(selectedProject, selectedDataset, dataType)}>
        <Form>
            <Form.Item label="Dataset">
                <DatasetTreeSelect style={{width: "100%"}}
                                   value={selectedDataset}
                                   onChange={onChangeInner}
                />
            </Form.Item>
        </Form>
    </Modal>;
};

DatasetSelectionModal.propTypes = {
    dataType: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
};

export default DatasetSelectionModal;
