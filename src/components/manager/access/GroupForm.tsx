import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { Button, Card, Divider, Form, type FormInstance, Input, List, Radio, type RadioChangeEvent } from "antd";
import type { Rule } from "antd/es/form/index";
import { PlusOutlined } from "@ant-design/icons";

import { useOpenIdConfig } from "bento-auth-js";

import MonospaceText from "@/components/common/MonospaceText";
import type { Group, GroupMembership, SpecificSubject } from "@/modules/authz/types";

import ExpiryInput from "./ExpiryInput";
import Subject from "./Subject";
import type { InputChangeEventHandler } from "./types";

type MembershipInputProps = {
    onChange?: (v: GroupMembership) => void;
    value?: GroupMembership;
};

const MEMBERSHIP_TYPE_OPTIONS = [
    { value: "list", label: "Subject / Client List" },
    { value: "expr", label: "Expression (Bento Query JSON Format)" },
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

const isValidJSONArray = (x: string): boolean => {
    if (x) {
        try {
            const y = JSON.parse(x);
            return Array.isArray(y);
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
    const [exprIsValidJSONArray, setExprIsValidJSONArray] = useState<boolean>(isValidJSONArray(expr));

    const [memberAddMode, setMemberAddMode] = useState<"sub" | "client">("sub");
    const [iss, setIss] = useState<string>(homeIssuer);
    const [issErrorReady, setIssErrorReady] = useState<boolean>(false);
    const [subOrClient, setSubOrClient] = useState<string>("");
    const [subOrClientErrorReady, setSubOrClientErrorReady] = useState<boolean>(false);

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
        if (onChange && (newMembershipType === "list" || exprIsValidJSONArray)) {
            onChange(buildMembership(newMembershipType, expr, members));
        }
    }, [onChange, expr, exprIsValidJSONArray, members]);

    const onChangeExpr = useCallback<InputChangeEventHandler>((e) => {
        const newExpr = e.target.value;
        setExpr(newExpr);

        const isValid = isValidJSONArray(newExpr);
        setExprIsValidJSONArray(isValid);

        if (onChange && isValid) {
            onChange(buildMembership(membershipType, newExpr, members));
        }
    }, [onChange, membershipType, members]);

    const onChangeMembers = useCallback((v: SpecificSubject[]) => {
        setMembers(v);
        if (onChange && (membershipType === "list" || exprIsValidJSONArray)) {
            onChange(buildMembership(membershipType, expr, v));
        }
    }, [onChange, membershipType, exprIsValidJSONArray, expr]);

    const memberListRenderItem = useCallback((item: SpecificSubject, idx: number) => (
        <List.Item>
            <Subject subject={item} style={{ width: "100%" }} onClose={() => {
                const newMembers = [...members];
                newMembers.splice(idx, 1);
                onChangeMembers(newMembers);
            }} />
        </List.Item>
    ), [members]);

    const onChangeMemberAddMode = useCallback((e: RadioChangeEvent) => {
        setMemberAddMode(e.target.value);
        setSubOrClient("");
    }, []);

    const onChangeIssuer = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setIss(e.target.value);
        setIssErrorReady(true);
    }, []);
    const onChangeSubOrClient = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSubOrClient(e.target.value);
        setSubOrClientErrorReady(true);
    }, []);

    const onAddMember = useCallback(() => {
        const issProcessed = iss.trim();
        const subOrClientProcessed = subOrClient.trim();

        if (!issProcessed) setIssErrorReady(true);
        if (!subOrClientProcessed) setSubOrClientErrorReady(true);
        if (!issProcessed || !subOrClientProcessed) return;

        onChangeMembers([
            ...members,
            {
                iss: issProcessed,
                ...(memberAddMode === "sub" ? { sub: subOrClientProcessed } : { client: subOrClientProcessed }),
            },
        ]);

        setSubOrClient("");
        setIssErrorReady(false);
        setSubOrClientErrorReady(false);
    }, [members, memberAddMode, iss, subOrClient]);

    return (
        <Card size="small" {...rest}>
            <Radio.Group value={membershipType} onChange={onChangeMembershipType} options={MEMBERSHIP_TYPE_OPTIONS} />
            <div style={{ marginTop: 16 }}>
                {membershipType === "list" ? (
                    <>
                        <List dataSource={members} renderItem={memberListRenderItem} />
                        <Divider style={{ marginTop: 12 }} />
                        <Radio.Group
                            value={memberAddMode}
                            onChange={onChangeMemberAddMode}
                            options={SPECIFIC_SUBJECT_TYPE_OPTIONS}
                        />
                        <div style={{ display: "flex", flexDirection: "row", gap: 16, marginTop: 16 }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    placeholder="Issuer URI"
                                    value={iss}
                                    onChange={onChangeIssuer}
                                    status={issErrorReady && iss.trim() === "" ? "error" : undefined}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    placeholder={memberAddMode === "sub" ? "Subject ID" : "Client ID"}
                                    value={subOrClient}
                                    onChange={onChangeSubOrClient}
                                    status={subOrClientErrorReady && subOrClient.trim() === "" ? "error" : undefined}
                                />
                            </div>
                            <Button icon={<PlusOutlined />} onClick={onAddMember}>Add</Button>
                        </div>
                    </>
                ) : (
                    <Form.Item extra={
                        <>
                            <p>
                                An expression to be evaluated on a subset of fields from a decoded JWT. For example, an
                                issuer/subject check could be implemented as follows:
                            </p>
                            <pre style={{ whiteSpace: "pre-wrap" }}>
                                [&quot;#and&quot;, <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;[&quot;#eq&quot;,
                                    [&quot;#resolve&quot;, &quot;iss&quot;], &quot;iss-value&quot;], <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;[&quot;#eq&quot;,
                                    [&quot;#resolve&quot;, &quot;sub&quot;], &quot;sub-value&quot;]] <br />
                            </pre>
                            <p style={{ marginBottom: 0 }}>
                                Fields which can be resolved are as follows:&nbsp;
                                <MonospaceText>iss, sub, azp, exp, iat, typ, scope</MonospaceText>
                            </p>
                        </>
                    } style={{ marginBottom: 0 }}>
                        <Input
                            spellCheck={false}
                            status={exprIsValidJSONArray ? undefined : "error"}
                            value={expr}
                            onChange={onChangeExpr}
                            placeholder="Expression"
                        />
                    </Form.Item>
                )}
            </div>
        </Card>
    );
};

const MEMBERSHIP_VALIDATOR_RULES: Rule[] = [{
    validator: (_r, v: GroupMembership) => {
        if ("expr" in v) {
            const expr = v.expr;
            if (!(Array.isArray(expr) && expr.length >= 3)) {  // 3 is minimum length for a relevant expression here.
                console.error("Invalid membership expression value:", v);
                return Promise.reject(
                    "Membership expression should be a valid Bento Query-formatted JSON array.");
            }
        } else {
            if (v.members.length === 0) {
                return Promise.reject("Membership list must have at least one entry.");
            }
        }
        return Promise.resolve();
    },
}];

const GroupForm = ({ form }: { form: FormInstance<Group> }) => (
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

export default GroupForm;
