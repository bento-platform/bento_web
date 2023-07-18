import { Modal } from "antd";

const { confirm } = Modal;

const confirmDataTypeDelete = (dataType, onOk, onCancel = null) => {
    confirm({
        title: `Are you sure you want to delete the "${dataType.label || ""}" data type?`,
        content: "Deleting this table means all data contained in the table will be deleted permanently" +
            ", andwill no longer be available for exploration.",
        onOk: onOk,
        onCancel: onCancel,
    });
};

export default confirmDataTypeDelete;
