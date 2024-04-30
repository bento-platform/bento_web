import { useCallback, useEffect, useMemo, useState } from "react";

import { Form, Input, Radio, Select, Space } from "antd";
import type { RadioGroupProps, RadioChangeEvent } from "antd";

import { RESOURCE_EVERYTHING } from "bento-auth-js";

import { useGroups } from "@/modules/authz/hooks";
import type { GrantSubject, StoredGroup } from "@/modules/authz/types";
import { useProjects } from "@/modules/metadata/hooks";
import type { Dataset, Project } from "@/modules/metadata/types";

import ExpiryInput from "./ExpiryInput";
import Resource from "./Resource";
import Subject from "./Subject";


const SUBJECT_EVERYONE: GrantSubject = { everyone: true };

type SubjectInputProps = {
    value?: GrantSubject;
    onChange?: (v: GrantSubject) => void;
};

const SubjectInput = ({ value, onChange }: SubjectInputProps) => {
    const groups: StoredGroup[] = useGroups().data;

    const [subjectType, setSubjectType] = useState<"everyone" | "iss-sub" | "iss-client" | "group">("everyone");
    const [iss, setIss] = useState("");
    const [sub, setSub] = useState("");
    const [client, setClient] = useState("");
    const [group, setGroup] = useState<number | undefined>(groups[0]?.id);

    useEffect(() => {
        if (group === undefined && groups.length) {
            setGroup(groups[0].id);
        }
    }, [group, groups]);

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
        const subjectType: "everyone" | "iss-sub" | "iss-client" | "group" = e.target.value;

        if (onChange) {
            // Controlled mode

            if (subjectType === "everyone") {
                onChange(SUBJECT_EVERYONE);
            } else if (subjectType === "iss-sub") {
                onChange({ iss, sub });
            } else if (subjectType === "iss-client") {
                onChange({ iss, client });
            } else if (subjectType === "group" && group !== undefined) {
                onChange({ group });
            }
        } else {
            // Uncontrolled mode; set directly
            setSubjectType(e.target.value);
        }
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


const ResourceInput = () => {
    const projects: Project[] = useProjects().items;
    const projectsByID: Record<string, Project> = useProjects().itemsByID;

    const [resourceType, setResourceType] = useState<"everything" | "project-plus">("everything");

    const resourceTypeOptions = useMemo<RadioGroupProps["options"]>(() => [
        { value: "everything", label: <Resource resource={RESOURCE_EVERYTHING} /> },
        { value: "project-plus", label: "Project + Optional Dataset + Optional Data Type", disabled: !projects.length },
    ], [projects]);

    const onChangeResourceType = useCallback((e: RadioChangeEvent) => {
        setResourceType(e.target.value);
    }, []);

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

    useEffect(() => {
        if (!selectedProject && projects.length) {
            setSelectedProject(projects[0]);
        }
    }, [selectedProject, projects]);

    const projectOptions = useMemo(() => projects.map((p: Project) => ({
        value: p.identifier,
        label: p.title,
    })), [projects]);

    const onChangeProject = useCallback((v: string) => {
        setSelectedProject(projectsByID[v]);
    }, [projectsByID]);

    const datasetOptions = useMemo(() => {
        const options = [{ value: "", label: "All datasets" }];

        if (!selectedProject) return options;

        options.push(...(selectedProject.datasets ?? []).map((d) => ({
            value: d.identifier,
            label: d.title,
        })));
    }, [selectedProject]);

    // TODO: data type options

    return <Space direction="vertical" style={{ width: "100%" }}>
        <Radio.Group value={resourceType} onChange={onChangeResourceType} options={resourceTypeOptions} />
        {resourceType === "project-plus" && (
            <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
                <div>
                    Project:{" "}
                    <Select
                        showSearch={true}
                        placeholder="Select a project"
                        value={selectedProject?.identifier ?? null}
                        options={projectOptions}
                        onChange={onChangeProject}
                    />
                </div>
                <div>
                    Dataset:{" "}
                    <Select
                        showSearch={true}
                        defaultValue=""
                        options={datasetOptions}
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
            <Form.Item name="subject" label="Subject" initialValue={SUBJECT_EVERYONE}>
                <SubjectInput />
            </Form.Item>
            <Form.Item name="resource" label="Resource" initialValue={RESOURCE_EVERYTHING}>
                <ResourceInput />
            </Form.Item>
            <Form.Item name="expiry" label="Expiry" initialValue={null}>
                <ExpiryInput />
            </Form.Item>
            <Form.Item name="notes" label="Notes" initialValue="">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="permissions" label="Permissions">
                <Select mode="multiple" options={[]} />
            </Form.Item>
        </Form>
    );
};

export default GrantForm;
