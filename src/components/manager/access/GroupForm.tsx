import { useCallback, useState } from "react";
import { Form, type FormInstance, Input, Radio, type RadioChangeEvent, Space } from "antd";
import { Grant, GroupMembership, SpecificSubject } from "@/modules/authz/types";

import ExpiryInput from "./ExpiryInput";
import type { InputChangeEventHandler } from "./types";

type MembershipInputProps = {
    onChange?: (v: GroupMembership) => void;
    value?: GroupMembership;
};

const membershipTypeOptions = [
    { value: "list", label: "Subject / Client List" },
    { value: "expr", label: "Expression (Bento Query Format)" },
];

const MembershipInput = ({ value, onChange, ...rest }: MembershipInputProps) => {
    const [membershipType, setMembershipType] = useState<"expr" | "list">("list");

    const [subjectList, setSubjectList] = useState<SpecificSubject[]>();
    const [expr, setExpr] = useState<string>("");

    const onChangeMembershipType = useCallback((e: RadioChangeEvent) => {
        const newMembershipType = e.target.value;
        setMembershipType(newMembershipType);
        // TODO: onChange
    }, []);

    const onChangeExpr = useCallback<InputChangeEventHandler>((e) => {
        const newExpr = e.target.value;
        setExpr(newExpr);
        // TODO: onChange
    }, []);

    return (
        <div {...rest}>
            <Radio.Group value={membershipType} onChange={onChangeMembershipType} options={membershipTypeOptions} />
            <div style={{ marginTop: 16 }}>
                {membershipType === "list" ? (
                    "TODO"
                ) : (
                    <Input value={expr} onChange={onChangeExpr} placeholder="Expression" />
                )}
            </div>
        </div>
    );
};

const GroupForm = ({ form }: { form: FormInstance<Grant> }) => {
    return (
        <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" initialValue="" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="membership" label="Membership">
                <MembershipInput />
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
