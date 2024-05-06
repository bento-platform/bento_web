import { useCallback, useEffect, useState } from "react";
import { Button, Card, Divider, Form, type FormInstance, Input, List, Radio, type RadioChangeEvent } from "antd";
import type { Rule } from "antd/es/form/index";
import { PlusOutlined } from "@ant-design/icons";

import type { Group, GroupMembership, SpecificSubject } from "@/modules/authz/types";

import ExpiryInput from "./ExpiryInput";
import Subject from "./Subject";
import type { InputChangeEventHandler } from "./types";
import { useOpenIdConfig } from "bento-auth-js";

type MembershipInputProps = {
    onChange?: (v: GroupMembership) => void;
    value?: GroupMembership;
};

const MEMBERSHIP_TYPE_OPTIONS = [
    { value: "list", label: "Subject / Client List" },
    { value: "expr", label: "Expression (Bento Query Format)" },
];

const SPECIFIC_SUBJECT_TYPE_OPTIONS = [
    { value: "sub", label: "Issuer + Subject" },
    { value: "client", label: "Issuer + Client" },
];

const buildMembership = (
    membershipType: "expr" | "list",
    expr: string,
    members: SpecificSubject[],
): GroupMembership => {
    if (membershipType === "expr") {
        return { expr: JSON.parse(expr) };
    } else {
        return { members };
    }
};

const isValidJSON = (x: string): boolean => {
    if (x) {
        try {
            JSON.parse(x);
            return true;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
};

const MembershipInput = ({ value, onChange, ...rest }: MembershipInputProps) => {
    const homeIssuer = useOpenIdConfig()?.issuer ?? "";

    const [membershipType, setMembershipType] = useState<"expr" | "list">("list");

    const [members, setMembers] = useState<SpecificSubject[]>([]);
    const [expr, setExpr] = useState<string>("");
    const [exprIsValidJSON, setExprIsValidJSON] = useState<boolean>(isValidJSON(expr));

    const [memberAddMode, setMemberAddMode] = useState<"sub" | "client">("sub");
    const [iss, setIss] = useState<string>(homeIssuer);
    const [subOrClient, setSubOrClient] = useState<string>("");

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
        if (onChange && (newMembershipType === "list" || exprIsValidJSON)) {
            onChange(buildMembership(newMembershipType, expr, members));
        }
    }, [onChange, expr, exprIsValidJSON, members]);

    const onChangeExpr = useCallback<InputChangeEventHandler>((e) => {
        const newExpr = e.target.value;
        setExpr(newExpr);

        const isValid = isValidJSON(newExpr);
        setExprIsValidJSON(isValid);

        if (onChange && isValid) {
            onChange(buildMembership(membershipType, newExpr, members));
        }
    }, [onChange, membershipType, members]);

    const onChangeMembers = useCallback((v: SpecificSubject[]) => {
        setMembers(v);
        if (onChange && (membershipType === "list" || exprIsValidJSON)) {
            onChange(buildMembership(membershipType, expr, v));
        }
    }, [onChange, membershipType, exprIsValidJSON, expr]);

    return (
        <Card size="small" {...rest}>
            <Radio.Group value={membershipType} onChange={onChangeMembershipType} options={MEMBERSHIP_TYPE_OPTIONS} />
            <div style={{ marginTop: 16 }}>
                {membershipType === "list" ? (
                    <>
                        <List
                            dataSource={members}
                            renderItem={(item, idx) => (
                                <List.Item>
                                    <Subject subject={item} style={{ width: "100%" }} onClose={() => {
                                        const newMembers = [...members];
                                        newMembers.splice(idx, 1);
                                        onChangeMembers(newMembers);
                                    }} />
                                </List.Item>
                            )}
                        />
                        <Divider style={{ marginTop: 12 }} />
                        <Radio.Group
                            value={memberAddMode}
                            onChange={(e) => {
                                setMemberAddMode(e.target.value);
                                setSubOrClient("");
                            }}
                            options={SPECIFIC_SUBJECT_TYPE_OPTIONS}
                        />
                        <div style={{ display: "flex", flexDirection: "row", gap: 16, marginTop: 16 }}>
                            <div style={{ flex: 1 }}>
                                <Input placeholder="Issuer" value={iss} onChange={(e) => setIss(e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    placeholder={memberAddMode === "sub" ? "Subject" : "Client"}
                                    value={subOrClient}
                                    onChange={(e) => setSubOrClient(e.target.value)}
                                />
                            </div>
                            <Button icon={<PlusOutlined />} onClick={() => {
                                onChangeMembers([
                                    ...members,
                                    memberAddMode === "sub" ? { iss, sub: subOrClient } : { iss, client: subOrClient },
                                ]);
                                setSubOrClient("");
                            }}>Add</Button>
                        </div>
                    </>
                ) : (
                    <Input
                        spellCheck={false}
                        status={exprIsValidJSON ? undefined : "error"}
                        value={expr}
                        onChange={onChangeExpr}
                        placeholder="Expression"
                    />
                )}
            </div>
        </Card>
    );
};

const MEMBERSHIP_VALIDATOR_RULES: Rule[] = [{
    validator: (_r, v: GroupMembership) => {
        if ("expr" in v) {
            // TODO
        } else {
            if (v.members.length === 0) {
                return Promise.reject("Membership list must have at least one entry.");
            }
        }
        return Promise.resolve();
    },
}];

const GroupForm = ({ form }: { form: FormInstance<Group> }) => {
    return (
        <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" initialValue="" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item
                name="membership"
                label="Membership"
                initialValue={{ members: [] }}
                rules={MEMBERSHIP_VALIDATOR_RULES}
            >
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
