import { Modal } from "antd";

const { confirm } = Modal;

const genericConfirm = ({ title, content, onOk, onCancel, ...rest }) => {
  confirm({
    title: title,
    content: content,
    onOk: onOk,
    onCancel,
    ...rest,
  });
};

export default genericConfirm;
