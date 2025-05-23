import { Fragment, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { Alert, Checkbox, Form, Input, Popover, Radio, Select, Space, Spin } from "antd";
import type { FormInstance, RadioGroupProps, RadioChangeEvent, SelectProps } from "antd";

import { RESOURCE_EVERYTHING, useOpenIdConfig } from "bento-auth-js";

import MonospaceText from "@/components/common/MonospaceText";
import { PERMISSIONS_HELP } from "@/modules/authz/help";
import { useAllPermissions, useGroups } from "@/modules/authz/hooks";
import type {
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
const SUBJECT_TYPE_EVERYONE = "everyone";
const SUBJECT_TYPE_ISS_SUB = "iss-sub";
const SUBJECT_TYPE_ISS_CLIENT = "iss-client";
const SUBJECT_TYPE_GROUP = "group";

const buildSubject = (
  subjectType: SubjectType,
  iss: string,
  sub: string,
  client: string,
  group: number | undefined,
): GrantSubject | undefined => {
  if (subjectType === SUBJECT_TYPE_EVERYONE) {
    return SUBJECT_EVERYONE;
  } else if (subjectType === SUBJECT_TYPE_ISS_SUB) {
    return { iss, sub };
  } else if (subjectType === SUBJECT_TYPE_ISS_CLIENT) {
    return { iss, client };
  } else if (subjectType === SUBJECT_TYPE_GROUP && group !== undefined) {
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

  const homeIssuer = useOpenIdConfig().data?.issuer ?? "";

  const [subjectType, setSubjectType] = useState<SubjectType>(SUBJECT_TYPE_EVERYONE);
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
      setSubjectType(SUBJECT_TYPE_EVERYONE);
    } else if ("iss" in value) {
      setIss(value.iss);
      if ("sub" in value) {
        setSub(value.sub);
        setClient("");
        setSubjectType(SUBJECT_TYPE_ISS_SUB);
      } else {
        setSub("");
        setClient(value.client);
        setSubjectType(SUBJECT_TYPE_ISS_CLIENT);
      }
    } else {
      // group
      setGroup(value.group);
      setSubjectType(SUBJECT_TYPE_GROUP);
    }
  }, [value]);

  const onChangeSubjectType = useCallback(
    (e: RadioChangeEvent) => {
      const newSubjectType = e.target.value;
      setSubjectType(newSubjectType);
      handleSubjectChange(onChange, newSubjectType, iss, sub, client, group);
    },
    [onChange, iss, sub, client, group],
  );

  const subjectTypeOptions = useMemo(
    () => [
      { value: SUBJECT_TYPE_ISS_SUB, label: "Issuer URI + Subject ID" },
      { value: SUBJECT_TYPE_ISS_CLIENT, label: "Issuer URI + Client ID" },
      { value: SUBJECT_TYPE_GROUP, label: "Group", disabled: groups.length === 0 },
      { value: SUBJECT_TYPE_EVERYONE, label: <Subject subject={SUBJECT_EVERYONE} boldLabel={false} /> },
    ],
    [groups],
  );

  const onChangeIssuer = useCallback<InputChangeEventHandler>(
    (e) => {
      const newIss = e.target.value;
      setIss(newIss);
      handleSubjectChange(onChange, subjectType, newIss, sub, client, group);
    },
    [onChange, subjectType, sub, client, group],
  );

  const onChangeSubject = useCallback<InputChangeEventHandler>(
    (e) => {
      const newSub = e.target.value;
      setSub(newSub);
      handleSubjectChange(onChange, subjectType, iss, newSub, client, group);
    },
    [onChange, subjectType, iss, client, group],
  );

  const onChangeClient = useCallback<InputChangeEventHandler>(
    (e) => {
      const newClient = e.target.value;
      setClient(newClient);
      handleSubjectChange(onChange, subjectType, iss, sub, newClient, group);
    },
    [onChange, subjectType, iss, sub, group],
  );

  const groupOptions = useMemo(
    () =>
      groups.map((g: StoredGroup) => ({
        value: g.id,
        label: (
          <>
            <strong>{g.name}</strong> (ID: {g.id})
          </>
        ),
      })),
    [groups],
  );

  const onChangeGroup = useCallback(
    (v: number) => {
      setGroup(v);
      handleSubjectChange(onChange, subjectType, iss, sub, client, v);
    },
    [onChange, subjectType, iss, sub, client],
  );

  return (
    <Space direction="vertical" style={{ width: "100%", minHeight: 32 }}>
      <Radio.Group value={subjectType} onChange={onChangeSubjectType} options={subjectTypeOptions} />
      {(subjectType === SUBJECT_TYPE_ISS_SUB || subjectType === SUBJECT_TYPE_ISS_CLIENT) && (
        <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
          <Input placeholder="Issuer URI" value={iss} onChange={onChangeIssuer} />
          {subjectType === SUBJECT_TYPE_ISS_SUB ? (
            <Input placeholder="Subject ID" value={sub} onChange={onChangeSubject} />
          ) : (
            <Input placeholder="Client ID" value={client} onChange={onChangeClient} />
          )}
        </Space>
      )}
      {subjectType === SUBJECT_TYPE_GROUP && (
        <Select
          showSearch={true}
          placeholder="Select a group"
          value={group}
          options={groupOptions}
          onChange={onChangeGroup}
        />
      )}
      {subjectType === SUBJECT_TYPE_EVERYONE && (
        <Alert
          message={
            <>
              <strong>Warning:</strong> The &ldquo;Everyone&rdquo; subject applies to ALL USERS, even anonymous ones,
              e.g., bots and random visitors to the portal!
            </>
          }
          type="warning"
          showIcon={true}
        />
      )}
    </Space>
  );
};

type ResourceSupertype = "everything" | "project-plus";
const RESOURCE_SUPERTYPE_EVERYTHING = "everything";
const RESOURCE_SUPERTYPE_PROJECT_PLUS = "project-plus";

const buildResource = (rt: ResourceSupertype, p: Project | null, d: Dataset | null, dt: string): GrantResource => {
  if (rt === RESOURCE_SUPERTYPE_EVERYTHING || p === null) {
    return RESOURCE_EVERYTHING;
  }

  const res: GrantResource = { project: p.identifier };

  if (d) res["dataset"] = d?.identifier;
  if (dt) res["data_type"] = dt;

  return res;
};

type ResourceInputProps = {
  value?: GrantResource;
  onChange?: (value: GrantResource) => void;
};

const ResourceInput = ({ value, onChange }: ResourceInputProps) => {
  // TODO: consolidate when useProjects() is typed
  const projects: Project[] = useProjects().items;
  const projectsByID: Record<string, Project> = useProjects().itemsByID;
  const datasetsByID: Record<string, Dataset> = useProjects().datasetsByID;
  const dataTypes: BentoServiceDataType[] = useDataTypes().items;

  const [resourceSupertype, setResourceSupertype] = useState<ResourceSupertype>("everything");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    if ("everything" in value) {
      setResourceSupertype(RESOURCE_SUPERTYPE_EVERYTHING);
    } else {
      setResourceSupertype(RESOURCE_SUPERTYPE_PROJECT_PLUS);
      // TODO: how to handle missing projects? i.e., what if the project is deleted?
      //  - right now, it doesn't matter since we cannot edit grants, but in the future we'll need to check.
      setSelectedProject(projectsByID[value.project]);
      // TODO: how to handle missing datasets? i.e., what if the dataset is deleted?
      //  - right now, it doesn't matter since we cannot edit grants, but in the future we'll need to check.
      if ("dataset" in value && value.dataset) setSelectedDataset(datasetsByID[value.dataset]);
      if ("data_type" in value && value.data_type) setSelectedDataType(value.data_type);
    }
  }, [value, projectsByID, datasetsByID]);

  useEffect(() => {
    if (!selectedProject && projects.length) {
      setSelectedProject(projects[0]);
    }
  }, [selectedProject, projects]);

  const resourceSupertypeOptions = useMemo<RadioGroupProps["options"]>(
    () => [
      { value: RESOURCE_SUPERTYPE_EVERYTHING, label: <Resource resource={RESOURCE_EVERYTHING} /> },
      {
        value: RESOURCE_SUPERTYPE_PROJECT_PLUS,
        label: "Project + Optional Dataset + Optional Data Type",
        disabled: !projects.length,
      },
    ],
    [projects],
  );

  const onChangeResourceSupertype = useCallback(
    (e: RadioChangeEvent) => {
      const newResourceSupertype = e.target.value;
      setResourceSupertype(newResourceSupertype);
      if (onChange) onChange(buildResource(newResourceSupertype, selectedProject, selectedDataset, selectedDataType));
    },
    [onChange, selectedProject, selectedDataset, selectedDataType],
  );

  const projectOptions = useMemo(
    (): SelectProps["options"] =>
      projects.map((p: Project) => ({
        value: p.identifier,
        label: p.title,
      })),
    [projects],
  );

  const onChangeProject = useCallback(
    (v: string) => {
      const p = projectsByID[v];
      setSelectedProject(p);
      setSelectedDataset(null);
      if (onChange) onChange(buildResource(resourceSupertype, p, null, selectedDataType));
    },
    [projectsByID, onChange, resourceSupertype, selectedDataType],
  );

  const datasetOptions = useMemo((): SelectProps["options"] => {
    const options: SelectProps["options"] = [{ value: "", label: "All datasets" }];

    if (selectedProject) {
      options.push(
        ...(selectedProject.datasets ?? []).map((d) => ({
          value: d.identifier,
          label: d.title,
        })),
      );
    }

    return options;
  }, [selectedProject]);

  const onChangeDataset = useCallback(
    (v: string) => {
      const d = datasetsByID[v];
      setSelectedDataset(d);
      if (onChange) onChange(buildResource(resourceSupertype, selectedProject, d, selectedDataType));
    },
    [datasetsByID, onChange, resourceSupertype, selectedProject, selectedDataType],
  );

  const dataTypeOptions = useMemo(
    (): SelectProps["options"] => [
      { value: "", label: "All data types" },
      ...dataTypes.map(({ id: value, label }) => ({ value, label })),
    ],
    [dataTypes],
  );

  const onChangeDataType = useCallback(
    (v: string) => {
      setSelectedDataType(v);
      if (onChange) onChange(buildResource(resourceSupertype, selectedProject, selectedDataset, v));
    },
    [onChange, resourceSupertype, selectedProject, selectedDataset],
  );

  return (
    <Space direction="vertical" style={{ width: "100%", minHeight: 32 }}>
      <Radio.Group value={resourceSupertype} onChange={onChangeResourceSupertype} options={resourceSupertypeOptions} />
      {resourceSupertype === RESOURCE_SUPERTYPE_PROJECT_PLUS && (
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
    </Space>
  );
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
    [permissions],
  );

  const [checked, setChecked] = useState<string[]>([]);

  const isInvalid = "aria-invalid" in rest && !!rest["aria-invalid"];

  useEffect(() => {
    // If we're in controlled mode, i.e., a value array is set, then the checked array should be set directly from the
    // value when it changes, if the values differ from whatever the checked array currently is internally.
    if (value !== undefined && newPermissionsDifferent(checked, value)) {
      setChecked(value);
    }
  }, [checked, value]);

  const handleChange = useCallback(
    (newChecked: string[]) => {
      const filteredNewChecked = newChecked.filter((cc) =>
        permissionCompatibleWithResource(permissionsByID[cc], currentResource),
      );
      if (newPermissionsDifferent(checked, filteredNewChecked)) {
        if (value === undefined) {
          // If we're not in "controlled mode", i.e., we don't have a value array set, then the value should not change,
          // so we should directly update the checked array.
          setChecked(filteredNewChecked);
        }
        if (onChange) {
          onChange(filteredNewChecked);
        }
      }
    },
    [checked, onChange, permissionsByID, currentResource, value],
  );

  useEffect(() => {
    const filteredChecked = [...checked, ...checked.flatMap((s) => permissionsByID[s].gives)].filter((c) =>
      permissionCompatibleWithResource(permissionsByID[c], currentResource),
    );
    if (newPermissionsDifferent(checked, filteredChecked)) {
      handleChange(filteredChecked);
    }
    // explicitly don't have checked as a dependency; otherwise, we get an infinite loop
  }, [currentResource]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkboxGroups = useMemo((): ReactNode => {
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
          const disabled = !permissionCompatibleWithResource(p, currentResource);
          const help: ReactNode | undefined = PERMISSIONS_HELP[p.id];
          return {
            value: p.id,
            label:
              !!help || (!disabled && givenByAnother) ? (
                <Popover
                  content={
                    <div style={{ maxWidth: 500 }}>
                      {!!help && (
                        <span>
                          {help}
                          {givenByAnother && <br />}
                        </span>
                      )}
                      {givenByAnother && (
                        <span>
                          <strong>Given by:</strong>{" "}
                          {givenBy.map((g, gi) => (
                            <Fragment key={g.id}>
                              <MonospaceText>{g.id}</MonospaceText>
                              {gi !== givenBy.length - 1 ? ", " : ""}
                            </Fragment>
                          ))}
                        </span>
                      )}
                    </div>
                  }
                >
                  <MonospaceText style={{ textDecoration: "underline", ...(givenByAnother ? { color: "#999" } : {}) }}>
                    {p.verb}
                  </MonospaceText>
                </Popover>
              ) : (
                <MonospaceText>{p.verb}</MonospaceText>
              ),
            disabled,
          };
        });

        const allDisabled = groupOptions.every((g) => g.disabled);

        const groupValue = checked.filter((c) => c in pByID);

        const onGroupChange = (selected: string[]) => {
          // Leave checkboxes that are not part of this check group
          const otherChecked = checked.filter((c) => !(c in pByID));

          const totalChecked = [...otherChecked, ...selected];
          handleChange(
            [...new Set([...totalChecked, ...totalChecked.flatMap((s) => permissionsByID[s].gives)])].filter((c) =>
              permissionCompatibleWithResource(permissionsByID[c], currentResource),
            ),
          );
        };

        return (
          <div
            key={k}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 8,
              border: isInvalid ? "1px solid #ff4d4f" : "1px solid #f0f0f0",
              borderRadius: 4,
              backgroundColor: `rgba(248, 248, 248, ${allDisabled ? "1" : "0"})`,
              cursor: allDisabled ? "not-allowed" : "auto",
              transition: "background-color ease-in-out 0.15s, border-color ease-in-out 0.15s",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                fontWeight: "bold",
                color: `rgba(0, 0, 0, ${allDisabled ? "0.44" : "0.88"})`,
              }}
            >
              {k}
            </span>
            <Checkbox.Group disabled={allDisabled} options={groupOptions} value={groupValue} onChange={onGroupChange} />
          </div>
        );
      });
  }, [checked, currentResource, handleChange, isInvalid, permissions, permissionsByID]);

  return (
    <Spin spinning={isFetchingPermissions}>
      <div
        id={id}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          borderRadius: 8,
        }}
        {...rest}
      >
        {checkboxGroups}
      </div>
    </Spin>
  );
};

const GrantForm = ({ form }: { form: FormInstance<Grant> }) => {
  const homeIssuer = useOpenIdConfig().data?.issuer ?? "";
  const defaultSubject = useMemo<GrantSubject>(() => ({ iss: homeIssuer, sub: "" }), [homeIssuer]);

  const currentResource = Form.useWatch("resource", form);

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="subject" label="Subject" initialValue={defaultSubject}>
        <SubjectInput />
      </Form.Item>
      <Form.Item name="resource" label="Resource" initialValue={RESOURCE_EVERYTHING}>
        <ResourceInput />
      </Form.Item>
      <Form.Item
        name="permissions"
        label="Permissions"
        initialValue={[]}
        rules={[{ type: "array", min: 1, message: "At least one permission must be specified" }]}
      >
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
