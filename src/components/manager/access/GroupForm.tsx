import { useCallback, useEffect, useState } from "react";
import { Button, Card, Divider, Form, type FormInstance, Input, List, Radio, type RadioChangeEvent } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import type { Group, GroupMembership, SpecificSubject } from "@/modules/authz/types";

import ExpiryInput from "./ExpiryInput";
import Subject from "./Subject";
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

    const [members, setMembers] = useState<SpecificSubject[]>([]);
    const [expr, setExpr] = useState<string>("");

    useEffect(() => {
        if (value) {
            if ("expr" in value) {
                setMembershipType("expr");
                setExpr(JSON.stringify(value.expr));
            } else {
                setMembershipType("list");
                setMembers(value.members);
            }
        }
    }, [value]);

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

    const [memberAddMode, setMemberAddMode] = useState<"sub" | "client">("sub");

    return (
        <Card size="small" {...rest}>
            <Radio.Group value={membershipType} onChange={onChangeMembershipType} options={membershipTypeOptions} />
            <div style={{ marginTop: 16 }}>
                {membershipType === "list" ? (
                    <>
                        <List
                            dataSource={members}
                            renderItem={(item) => <Subject subject={item} onClose={() => console.log("TODO")} />}
                        />
                        <Divider />
                        <Radio.Group
                            value={memberAddMode}
                            onChange={(e) => setMemberAddMode(e.target.value)}
                            options={[
                                { value: "sub", label: "Issuer + Subject" },
                                { value: "client", label: "Issuer + Client" },
                            ]}
                        />
                        <div style={{ display: "flex", flexDirection: "row", gap: 16, marginTop: 16 }}>
                            <div style={{ flex: 1 }}>
                                <Input placeholder="Issuer" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input placeholder="Subject" />
                            </div>
                            <Button icon={<PlusOutlined />}>Add</Button>
                        </div>
                    </>
                ) : (
                    <Input value={expr} onChange={onChangeExpr} placeholder="Expression" />
                )}
            </div>
        </Card>
    );
};

const GroupForm = ({ form }: { form: FormInstance<Group> }) => {
    return (
        <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" initialValue="" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="membership" label="Membership" initialValue={{ members: [] }}>
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
