import { useCallback, useEffect, useMemo, useState } from "react";

import { DatePicker, Form, Input, Radio, Select, Space } from "antd";
import type { RadioChangeEvent } from "antd";

import { RESOURCE_EVERYTHING } from "bento-auth-js";

import type { GrantSubject, StoredGroup } from "@/modules/authz/types";
import type { Project } from "@/modules/metadata/types";

import Resource from "./Resource";
import Subject from "./Subject";
import { useProjects } from "@/modules/metadata/hooks";
import { useGroups } from "@/modules/authz/hooks";


const SUBJECT_EVERYONE: GrantSubject = { everyone: true };

type SubjectInputProps = {
    value?: GrantSubject;
    onChange?: (v: GrantSubject) => void;
};

const SubjectInput = ({ value, onChange }: SubjectInputProps) => {
    const { data: groups } = useGroups();

    const [subjectType, setSubjectType] = useState<"everyone" | "iss-sub" | "iss-client" | "group">("everyone");
    const [iss, setIss] = useState("");
    const [sub, setSub] = useState("");
    const [client, setClient] = useState("");
    const [group, setGroup] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!value) return;
        if ("everyone" in value) {
            setSubjectType("everyone");
        } else if ("iss" in value) {
            setIss(value.iss);
            if ("sub" in value) {
                setSub(value.sub);
                setClient("");
            } else {
                setSub("");
                setClient(value.client);
            }
        } else {  // group
            setGroup(value.group);
        }
    }, [value]);

    const onChangeSubjectType = useCallback((e: RadioChangeEvent) => {
        setSubjectType(e.target.value);
    }, []);

    const subjectTypeOptions = useMemo(() => [
        { value: "everyone", label: <Subject subject={SUBJECT_EVERYONE} /> },
        { value: "iss-sub", label: "Issuer + Subject" },
        { value: "iss-client", label: "Issuer + Client" },
        { value: "group", label: "Group", disabled: groups.length === 0 },
    ], [groups]);

    return <Space direction="vertical" style={{ width: "100%" }}>
        <Radio.Group value={subjectType} onChange={onChangeSubjectType} options={subjectTypeOptions} />
        {(subjectType === "iss-sub" || subjectType === "iss-client") && (
            <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
                <Input placeholder="Issuer" value={iss} />
                {subjectType === "iss-sub" ? (
                    <Input placeholder="Subject ID" value={sub} />
                ) : (
                    <Input placeholder="Client ID" value={client} />
                )}
            </Space>
        )}
        {subjectType === "group" && (
            <Select
                showSearch={true}
                placeholder="Select a group"
                value={group}
                options={groups.map((g: StoredGroup) => ({
                    value: g.id,
                    label: <><strong>Group {g.id}:</strong> {g.name}</>,
                }))}
            />
        )}
    </Space>;
};


const RESOURCE_TYPE_OPTIONS = [
    { value: "everything", label: <Resource resource={RESOURCE_EVERYTHING} /> },
    { value: "project-plus", label: "Project + Optional Dataset + Optional Data Type" },
];

const ResourceInput = () => {
    const { items: projects } = useProjects();

    const [resourceType, setResourceType] = useState<"everything" | "project-plus">("everything");

    const onChangeResourceType = useCallback((e: RadioChangeEvent) => {
        setResourceType(e.target.value);
    }, []);

    return <Space direction="vertical" style={{ width: "100%" }}>
        <Radio.Group value={resourceType} onChange={onChangeResourceType} options={RESOURCE_TYPE_OPTIONS} />
        {resourceType === "project-plus" && (
            <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
                <div>
                    Project:{" "}
                    <Select
                        showSearch={true}
                        placeholder="Select a project"
                        options={projects.map((p: Project) => ({
                            value: p.identifier,
                            label: p.title,
                        }))}
                    />
                </div>
                <div>
                    Dataset:{" "}
                    <Select
                        showSearch={true}
                        defaultValue=""
                        options={[{ value: "", label: "All datasets" }]}
                    />
                </div>
                <div>
                    Data Type:{" "}
                    <Select
                        showSearch={true}
                        defaultValue=""
                        options={[{ value: "", label: "All data types" }]}
                    />
                </div>
            </Space>
        )}
    </Space>;
};


const GrantForm = () => {
    return (
        <Form layout="vertical">
            <Form.Item name="subject" label="Subject">
                <SubjectInput />
            </Form.Item>
            <Form.Item label="Resource">
                <ResourceInput />
            </Form.Item>
            <Form.Item label="Expiry" initialValue="none">
                <Radio.Group>
                    <Space direction="vertical">
                        <Radio value="none">None</Radio>
                        <Radio value="expiry"><DatePicker showTime={true} /></Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>
            <Form.Item name="notes" label="Notes">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="permissions" label="Permissions">
                <Select mode="multiple" options={[]} />
            </Form.Item>
        </Form>
    );
};

export default GrantForm;
