import { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { Checkbox, Form, Input, Popover, Radio, Select, Space, Spin } from "antd";
import type { FormInstance, RadioGroupProps, RadioChangeEvent, SelectProps } from "antd";

import { RESOURCE_EVERYTHING, useOpenIdConfig } from "bento-auth-js";

import MonospaceText from "@/components/common/MonospaceText";
import { useAllPermissions, useGroups } from "@/modules/authz/hooks";
import {
    Grant,
    GrantSubject,
    PermissionDefinition,
    Resource as GrantResource,
    StoredGroup,
} from "@/modules/authz/types";
import { useDataTypes } from "@/modules/services/hooks";
import type { BentoServiceDataType } from "@/modules/services/types";
import { useProjects } from "@/modules/metadata/hooks";
import type { Dataset, Project } from "@/modules/metadata/types";

import ExpiryInput from "./ExpiryInput";
import Resource from "./Resource";
import Subject from "./Subject";
import type { InputChangeEventHandler } from "./types";


const SUBJECT_EVERYONE: GrantSubject = { everyone: true };

type SubjectInputProps = {
    value?: GrantSubject;
    onChange?: (v: GrantSubject) => void;
};

type SubjectType = "everyone" | "iss-sub" | "iss-client" | "group";

const buildSubject = (
    subjectType: SubjectType,
    iss: string,
    sub: string,
    client: string,
    group: number | undefined,
): GrantSubject | undefined => {
    if (subjectType === "everyone") {
        return SUBJECT_EVERYONE;
    } else if (subjectType === "iss-sub") {
        return { iss, sub };
    } else if (subjectType === "iss-client") {
        return { iss, client };
    } else if (subjectType === "group" && group !== undefined) {
        return { group };
    }
};

const handleSubjectChange = (
    onChange: ((value: GrantSubject) => void) | undefined,
    subjectType: SubjectType,
    iss: string,
    sub: string,
    client: string,
    group: number | undefined,
) => {
    if (onChange) {
        const subject = buildSubject(subjectType, iss, sub, client, group);
        if (subject) onChange(subject);
    }
};

const SubjectInput = ({ value, onChange }: SubjectInputProps) => {
    const groups: StoredGroup[] = useGroups().data;

    const homeIssuer = useOpenIdConfig()?.issuer ?? "";

    const [subjectType, setSubjectType] = useState<"everyone" | "iss-sub" | "iss-client" | "group">("everyone");
    const [iss, setIss] = useState(homeIssuer);
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

    const onChangeDeps = [onChange, subjectType, iss, sub, client, group];

    const onChangeSubjectType = useCallback((e: RadioChangeEvent) => {
        const newSubjectType = e.target.value;
        setSubjectType(newSubjectType);
        handleSubjectChange(onChange, newSubjectType, iss, sub, client, group);
    }, onChangeDeps);

    const subjectTypeOptions = useMemo(() => [
        { value: "everyone", label: <Subject subject={SUBJECT_EVERYONE} boldLabel={false} /> },
        { value: "iss-sub", label: "Issuer + Subject" },
        { value: "iss-client", label: "Issuer + Client" },
        { value: "group", label: "Group", disabled: groups.length === 0 },
    ], [groups]);

    const onChangeIssuer = useCallback<InputChangeEventHandler>((e) => {
        const newIss = e.target.value;
        setIss(newIss);
        handleSubjectChange(onChange, subjectType, newIss, sub, client, group);
    }, onChangeDeps);

    const onChangeSubject = useCallback<InputChangeEventHandler>((e) => {
        const newSub = e.target.value;
        setSub(newSub);
        handleSubjectChange(onChange, subjectType, iss, newSub, client, group);
    }, onChangeDeps);

    const onChangeClient = useCallback<InputChangeEventHandler>((e) => {
        const newClient = e.target.value;
        setClient(newClient);
        handleSubjectChange(onChange, subjectType, iss, sub, newClient, group);
    }, onChangeDeps);

    const groupOptions = useMemo(() => groups.map((g: StoredGroup) => ({
        value: g.id,
        label: <><strong>Group {g.id}:</strong> {g.name}</>,
    })), [groups]);

    const onChangeGroup = useCallback((v: number) => {
        setGroup(v);
        handleSubjectChange(onChange, subjectType, iss, sub, client, v);
    }, onChangeDeps);

    return <Space direction="vertical" style={{ width: "100%", minHeight: 32 }}>
        <Radio.Group value={subjectType} onChange={onChangeSubjectType} options={subjectTypeOptions} />
        {(subjectType === "iss-sub" || subjectType === "iss-client") && (
            <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
                <Input placeholder="Issuer" value={iss} onChange={onChangeIssuer} />
                {subjectType === "iss-sub" ? (
                    <Input placeholder="Subject ID" value={sub} onChange={onChangeSubject} />
                ) : (
                    <Input placeholder="Client ID" value={client} onChange={onChangeClient} />
                )}
            </Space>
        )}
        {subjectType === "group" && (
            <Select
                showSearch={true}
                placeholder="Select a group"
                value={group}
                options={groupOptions}
                onChange={onChangeGroup}
            />
        )}
    </Space>;
};


const buildResource = (
    rt: "everything" | "project-plus",
    p: Project | null,
    d: Dataset | null,
    dt: string,
): GrantResource => {
    if (rt === "everything" || p === null) {
        return RESOURCE_EVERYTHING;
    }

    const res: GrantResource = { "project": p.identifier };

    if (d) res["dataset"] = d?.identifier;
    if (dt) res["data_type"] = dt;

    return res;
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

    const [resourceType, setResourceType] = useState<"everything" | "project-plus">("everything");
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

    const resourceTypeOptions = useMemo<RadioGroupProps["options"]>(() => [
        { value: "everything", label: <Resource resource={RESOURCE_EVERYTHING} /> },
        { value: "project-plus", label: "Project + Optional Dataset + Optional Data Type", disabled: !projects.length },
    ], [projects]);

    const onChangeResourceType = useCallback((e: RadioChangeEvent) => {
        const newResourceType = e.target.value;
        setResourceType(newResourceType);
        if (onChange) onChange(buildResource(newResourceType, selectedProject, selectedDataset, selectedDataType));
    }, [onChange, selectedProject, selectedDataset, selectedDataType]);

    const projectOptions = useMemo((): SelectProps["options"] => projects.map((p: Project) => ({
        value: p.identifier,
        label: p.title,
    })), [projects]);

    const onChangeProject = useCallback((v: string) => {
        const p = projectsByID[v];
        setSelectedProject(p);
        setSelectedDataset(null);
        if (onChange) onChange(buildResource(resourceType, p, null, selectedDataType));
    }, [projectsByID, onChange, resourceType, selectedDataType]);

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
        const d = datasetsByID[v];
        setSelectedDataset(d);
        if (onChange) onChange(buildResource(resourceType, selectedProject, d, selectedDataType));
    }, [datasetsByID, onChange, resourceType, selectedProject, selectedDataType]);

    const dataTypeOptions = useMemo((): SelectProps["options"] => [
        { value: "", label: "All data types" },
        ...dataTypes.map(({ id: value, label }) => ({ value, label })),
    ], [dataTypes]);

    const onChangeDataType = useCallback((v: string) => {
        setSelectedDataType(v);
        if (onChange) onChange(buildResource(resourceType, selectedProject, selectedDataset, v));
    }, [onChange, resourceType, selectedProject, selectedDataset]);

    return <Space direction="vertical" style={{ width: "100%", minHeight: 32 }}>
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


type PermissionsInputProps = {
    id?: string;
    value?: string[];
    onChange?: (value: string[]) => void;
    currentResource: GrantResource;
};

const newPermissionsDifferent = (checked: string[], newChecked: string[]): boolean => {
    const newValueSet = new Set([...newChecked]);
    const checkedSet = new Set([...checked]);

    const difference1 = new Set(checked.filter((c) => !newValueSet.has(c)));
    const difference2 = new Set(newChecked.filter((c) => !checkedSet.has(c)));

    return !!difference1.size || !!difference2.size;
};

const permissionCompatibleWithResource = (p: PermissionDefinition, r: GrantResource) => {
    const validDataTypeNarrowing = p.supports_data_type_narrowing || !("data_type" in r);

    if (p.min_level_required === "dataset") {
        return validDataTypeNarrowing;
    } else if (p.min_level_required === "project") {
        return validDataTypeNarrowing && !("dataset" in r);
    } else if (p.min_level_required === "instance") {
        return validDataTypeNarrowing && "everything" in r;
    }

    throw new Error(`missing handling for permissions level: ${p.min_level_required}`);
};

const PermissionsInput = ({ id, value, onChange, currentResource, ...rest }: PermissionsInputProps) => {
    const permissions: PermissionDefinition[] = useAllPermissions().data;
    const isFetchingPermissions = useAllPermissions().isFetching;
    const permissionsByID = useMemo(
        () => Object.fromEntries(permissions.map((p: PermissionDefinition) => [p.id, p])),
        [permissions]);

    const [checked, setChecked] = useState<string[]>([]);

    const isInvalid = "aria-invalid" in rest && !!rest["aria-invalid"];

    useEffect(() => {
        if (value && newPermissionsDifferent(checked, value)) {
            setChecked(value);
        }
    }, [value]);

    const handleChange = useCallback((c: string[]) => {
        if (newPermissionsDifferent(checked, c)) {
            setChecked(c);
            if (onChange) onChange(c);
        }
    }, [checked, onChange]);

    useEffect(() => {
        handleChange(checked.filter((c) => permissionCompatibleWithResource(permissionsByID[c], currentResource)));
    }, [currentResource, handleChange, checked]);

    const checkboxGroups = useMemo(
        (): ReactNode => {
            // TODO: use Object.groupBy when available:
            const permissionsByNoun = permissions.reduce<Record<string, PermissionDefinition[]>>((acc, p) => {
                if (!(p.noun in acc)) acc[p.noun] = [];
                acc[p.noun].push(p);
                return acc;
            }, {});

            return Object.entries(permissionsByNoun)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([k, v]) => {
                    const pByID = Object.fromEntries(v.map((p) => [p.id, p]));

                    const pGivenBy: Record<string, PermissionDefinition[]> = Object.fromEntries(
                        v.map((p) => [p.id, permissions.filter((pp: PermissionDefinition) => pp.gives.includes(p.id))]),
                    );

                    const groupOptions = v.map((p) => {
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
                                    <MonospaceText style={{ textDecoration: "underline", color: "#999" }}>
                                        {p.verb}
                                    </MonospaceText>
                                </Popover>
                            ) : <MonospaceText>{p.verb}</MonospaceText>,
                            disabled: !permissionCompatibleWithResource(p, currentResource),
                        };
                    });

                    const allDisabled = groupOptions.every((g) => g.disabled);

                    const groupValue = checked.filter((c) => c in pByID);

                    const onGroupChange = (selected: string[]) => {
                        // Leave checkboxes that are not part of this check group
                        const otherChecked = checked.filter((c) => !(c in pByID));

                        const totalChecked = [...otherChecked, ...selected];
                        handleChange([...new Set([
                            ...totalChecked,
                            // TODO: gives only if in right scope (can't give project-level bool on dataset)
                            ...totalChecked.flatMap((s) => permissionsByID[s].gives),
                        ])]);
                    };

                    return (
                        <div key={k} style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: 8,
                            border: isInvalid ? "1px solid #ff4d4f" : "1px solid #f0f0f0",
                            borderRadius: 4,
                            backgroundColor: `rgba(248, 248, 248, ${allDisabled ? "1" : "0"})`,
                            cursor: allDisabled ? "not-allowed" : "auto",
                            transition: "background-color ease-in-out 0.15s, border-color ease-in-out 0.15s",
                        }}>
                            <span style={{
                                fontSize: 12,
                                fontFamily: "monospace",
                                fontWeight: "bold",
                                color: `rgba(0, 0, 0, ${allDisabled ? "0.44" : "0.88"})`,
                            }}>{k}</span>
                            <Checkbox.Group
                                disabled={allDisabled}
                                options={groupOptions}
                                value={groupValue}
                                onChange={onGroupChange}
                            />
                        </div>
                    );
                });
        },
        [permissions, handleChange, currentResource, isInvalid]);

    return (
        <Spin spinning={isFetchingPermissions}>
            <div id={id} style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                borderRadius: 8,
            }} {...rest}>
                {checkboxGroups}
            </div>
        </Spin>
    );
};


const GrantForm = ({ form }: { form: FormInstance<Grant> }) => {
    const currentResource = Form.useWatch("resource", form);

    return (
        <Form form={form} layout="vertical">
            <Form.Item name="subject" label="Subject" initialValue={SUBJECT_EVERYONE}>
                <SubjectInput />
            </Form.Item>
            <Form.Item name="resource" label="Resource" initialValue={RESOURCE_EVERYTHING}>
                <ResourceInput />
            </Form.Item>
            <Form.Item name="permissions" label="Permissions" initialValue={[]} rules={[
                { type: "array", min: 1, message: "At least one permission must be specified" },
            ]}>
                <PermissionsInput currentResource={currentResource ?? RESOURCE_EVERYTHING} />
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
