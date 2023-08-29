import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";

import {Form, Modal} from "antd";

import DatasetTreeSelect from "./DatasetTreeSelect";

import {nop} from "../../utils/misc";

const WIDTH_100 = {width: "100%"};

const DatasetSelectionModal = ({dataType, title, visible, onCancel, onOk}) => {

    const [selectedProject, setSelectedProject] = useState(undefined);
    const [selectedDataset, setSelectedDataset] = useState(undefined);

    const onChangeInner = useCallback((project, dataset) => {
        setSelectedProject(project);
        setSelectedDataset(dataset);
    }, []);

    const onOkInner = useCallback(
        () => (onOk || nop)(selectedProject, selectedDataset, dataType),
        [onOk, selectedProject, selectedDataset, dataType]
    );

    return <Modal title={title || "Select a Dataset"}
                  visible={visible || false}
                  onCancel={onCancel || nop}
                  onOk={onOkInner}>
        <Form>
            <Form.Item label="Dataset">
                <DatasetTreeSelect style={WIDTH_100} value={selectedDataset} onChange={onChangeInner} />
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
