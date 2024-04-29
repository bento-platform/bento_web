import { Form, Input } from "antd";

import ExpiryInput from "./ExpiryInput";

const GroupForm = () => {
    return (
        <Form layout="vertical">
            <Form.Item name="name" label="Name" initialValue="">
                <Input />
            </Form.Item>
            <Form.Item name="membership" label="Membership">
                <Input /* TODO */ />
            </Form.Item>
            <Form.Item name="expiry" label="Expiry" initialValue={null}>
                <ExpiryInput />
            </Form.Item>
            <Form.Item name="notes" label="Notes" initialValue="">
                <Input.TextArea />
            </Form.Item>
        </Form>
    );
};

export default GroupForm;
