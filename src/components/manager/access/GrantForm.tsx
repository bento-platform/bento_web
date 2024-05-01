import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { Checkbox, Form, Input, Popover, Radio, Select, Space, Spin } from "antd";
import type { RadioGroupProps, RadioChangeEvent, SelectProps } from "antd";

import { RESOURCE_EVERYTHING } from "bento-auth-js";

import { useAllPermissions, useGroups } from "@/modules/authz/hooks";
import { GrantSubject, PermissionDefinition, Resource as GrantResource, StoredGroup } from "@/modules/authz/types";
import { useProjects } from "@/modules/metadata/hooks";
import type { Dataset, Project } from "@/modules/metadata/types";

import ExpiryInput from "./ExpiryInput";
import Resource from "./Resource";
import Subject from "./Subject";
import { useDataTypes } from "@/modules/services/hooks";
import { BentoServiceDataType } from "@/modules/services/types";
import MonospaceText from "@/components/common/MonospaceText";


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
        { value: "everyone", label: <Subject subject={SUBJECT_EVERYONE} boldLabel={false} /> },
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


type ResourceInputProps = {
    value?: GrantResource,
    onChange?: (value: GrantResource) => void;
};

const ResourceInput = ({ value, onChange }: ResourceInputProps) => {
    // TODO: consolidate when useProjects() is typed
    const projects: Project[] = useProjects().items;
    const projectsByID: Record<string, Project> = useProjects().itemsByID;
    const datasetsByID: Record<string, Dataset> = useProjects().datasetsByID;
    const dataTypes: BentoServiceDataType[] = useDataTypes().items;
    // const dataTypes =

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
    const [selectedDataType, setSelectedDataType] = useState<string>("");

    useEffect(() => {
        if (!value) return;
        if ("everything" in value) {
            setResourceType("everything");
        } else {
            // TODO: how to handle missing projects?
            setSelectedProject(projectsByID[value.project]);
            // TODO: how to handle missing datasets?
            if ("dataset" in value && value.dataset) setSelectedDataset(datasetsByID[value.dataset]);
            if ("data_type" in value && value.data_type) setSelectedDataType(value.data_type);
        }
    }, [value]);

    useEffect(() => {
        if (!selectedProject && projects.length) {
            setSelectedProject(projects[0]);
        }
    }, [selectedProject, projects]);

    const buildResource = useCallback((): GrantResource => {
        if (resourceType === "everything" || selectedProject === null) {
            return RESOURCE_EVERYTHING;
        }

        const res: GrantResource = { "project": selectedProject?.identifier };

        if (selectedDataset) res["dataset"] = selectedDataset?.identifier;
        if (selectedDataType) res["data_type"] = selectedDataType;

        return res;
    }, []);

    const projectOptions = useMemo((): SelectProps["options"] => projects.map((p: Project) => ({
        value: p.identifier,
        label: p.title,
    })), [projects]);

    const onChangeProject = useCallback((v: string) => {
        setSelectedProject(projectsByID[v]);
        if (onChange) onChange(buildResource());
    }, [projectsByID, onChange, buildResource]);

    const datasetOptions = useMemo((): SelectProps["options"] => {
        const options: SelectProps["options"] = [{ value: "", label: "All datasets" }];

        if (selectedProject) {
            options.push(...(selectedProject.datasets ?? []).map((d) => ({
                value: d.identifier,
                label: d.title,
            })));
        }

        return options;
    }, [selectedProject]);

    const onChangeDataset = useCallback((v: string) => {
        setSelectedDataset(datasetsByID[v]);
        if (onChange) onChange(buildResource());
    }, [datasetsByID, onChange, buildResource]);

    const dataTypeOptions = useMemo((): SelectProps["options"] => [
        { value: "", label: "All data types" },
        ...dataTypes.map(({ id: value, label }) => ({ value, label })),
    ], [dataTypes]);

    const onChangeDataType = useCallback((v: string) => setSelectedDataType(v), []);

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
                        value={selectedDataset?.identifier ?? ""}
                        options={datasetOptions}
                        onChange={onChangeDataset}
                    />
                </div>
                <div>
                    Data Type:{" "}
                    <Select
                        showSearch={true}
                        defaultValue=""
                        value={selectedDataType}
                        options={dataTypeOptions}
                        onChange={onChangeDataType}
                    />
                </div>
            </Space>
        )}
    </Space>;
};


const PermissionsInput = () => {
    const { data: permissions, isFetching: isFetchingPermissions } = useAllPermissions();
    const permissionsByID = useMemo(
        () => Object.fromEntries(permissions.map((p: PermissionDefinition) => [p.id, p])),
        [permissions]);

    const [checked, setChecked] = useState<string[]>([]);

    const permissionsByNoun = useMemo(
        () => {
            // TODO: use Object.groupBy when available:
            const res: Record<string, PermissionDefinition[]> = {};
            permissions.forEach((p: PermissionDefinition) => {
                if (!(p.noun in res)) {
                    res[p.noun] = [p];
                } else {
                    res[p.noun].push(p);
                }
            });
            return res;
        },
        [permissions]);

    return (
        <Spin spinning={isFetchingPermissions}>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {Object.entries(permissionsByNoun).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => {
                    const pByID = Object.fromEntries(v.map((p) => [p.id, p]));

                    const pGivenBy: Record<string, PermissionDefinition[]> = Object.fromEntries(
                        v.map((p) => [p.id, permissions.filter((pp: PermissionDefinition) => pp.gives.includes(p.id))]),
                    );

                    return (
                        <div key={k} style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: 8,
                            border: "1px solid #f0f0f0",
                            borderRadius: 4,
                        }}>
                            <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: "bold" }}>{k}</span>
                            <Checkbox.Group
                                options={v.map((p) => {
                                    const givenBy = pGivenBy[p.id] ?? [];
                                    const givenByAnother = givenBy.some((g) => checked.includes(g.id));
                                    return {
                                        value: p.id,
                                        label: givenByAnother ? (
                                            <Popover content={<span>Given by: {givenBy.map((g, gi) => (
                                                <Fragment key={g.id}>
                                                    <MonospaceText>
                                                        {g.id}
                                                    </MonospaceText>
                                                    {gi !== givenBy.length - 1 ? ", " : ""}
                                                </Fragment>
                                            ))}</span>}>
                                                <MonospaceText style={{ textDecoration: "underline" }}>
                                                    {p.verb}
                                                </MonospaceText>
                                            </Popover>
                                        ) : <MonospaceText>{p.verb}</MonospaceText>,
                                    };
                                })}
                                value={checked.filter((c) => c in pByID)}
                                onChange={(selected) => {
                                    // Leave checkboxes that are not part of this check group
                                    const otherChecked = checked.filter((c) => !(c in pByID));

                                    const totalChecked = [
                                        ...otherChecked,
                                        ...selected,
                                    ];
                                    setChecked([...new Set([
                                        ...totalChecked,
                                        // TODO: gives only if in right scope (can't give project-level bool on dataset)
                                        ...totalChecked.flatMap((s) => permissionsByID[s].gives),
                                    ])]);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </Spin>
    );
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
            <Form.Item name="permissions" label="Permissions">
                <PermissionsInput />
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

export default GrantForm;
