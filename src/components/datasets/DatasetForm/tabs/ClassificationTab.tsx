import { useState } from "react";
import { Button, Card, Dropdown, Form, Input, Radio, Typography } from "antd";
import type { MenuProps, RadioChangeEvent } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { COMMON_ONTOLOGIES, COMMON_KEYWORD_PRESETS } from "../constants";

const { Text } = Typography;

const LicenseSection = () => {
  const form = Form.useFormInstance();
  const [isAdded, setIsAdded] = useState(() => {
    const v = form.getFieldValue("license");
    return !!(v?.label || v?.type || v?.url);
  });

  const handleRemove = () => {
    form.setFieldValue(["license", "label"], undefined);
    form.setFieldValue(["license", "type"], undefined);
    form.setFieldValue(["license", "url"], undefined);
    setIsAdded(false);
  };

  return (
    <Card title="License" size="small" style={{ marginBottom: 8 }}>
      {isAdded ? (
        <>
          <Form.Item label="Label" name={["license", "label"]} rules={[{ required: true, min: 1 }]}>
            <Input placeholder="e.g. Creative Commons BY 4.0" />
          </Form.Item>
          <Form.Item label="Type" name={["license", "type"]} rules={[{ required: true, min: 1 }]}>
            <Input placeholder="e.g. CC-BY-4.0" />
          </Form.Item>
          <Form.Item label="URL" name={["license", "url"]} rules={[{ required: true, type: "url" }]}>
            <Input placeholder="https://creativecommons.org/licenses/by/4.0/" />
          </Form.Item>
          <Button danger size="small" onClick={handleRemove}>
            Remove
          </Button>
        </>
      ) : (
        <Button type="dashed" onClick={() => setIsAdded(true)} icon={<PlusOutlined />}>
          Add license
        </Button>
      )}
    </Card>
  );
};

const OntologyFields = ({ listName, name }: { listName: string; name: number }) => {
  const form = Form.useFormInstance();
  const type = Form.useWatch([listName, name, "type"], form) ?? "string";

  const handleTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === "ontology") {
      form.setFieldValue([listName, name, "value"], undefined);
    } else {
      form.setFieldValue([listName, name, "id"], undefined);
      form.setFieldValue([listName, name, "label"], undefined);
    }
  };

  const handleIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (listName !== "keywords" && listName !== "taxa") return;
    const prefix = e.target.value.trim().split(":")[0];
    if (!prefix) return;
    const ontology = COMMON_ONTOLOGIES[prefix] ?? COMMON_ONTOLOGIES[prefix.toUpperCase()];
    if (!ontology) return;
    const current: Record<string, unknown>[] = form.getFieldValue("resources") ?? [];
    if (current.some((r) => r.namespace_prefix === ontology.namespace_prefix)) return;
    form.setFieldValue("resources", [...current, { ...ontology, version: "" }]);
  };

  return (
    <>
      <Form.Item name={[name, "type"]} style={{ marginBottom: 8 }}>
        <Radio.Group onChange={handleTypeChange}>
          <Radio value="string">Plain text</Radio>
          <Radio value="ontology">OntologyClass</Radio>
        </Radio.Group>
      </Form.Item>
      {type === "ontology" ? (
        <>
          <Form.Item label="Ontology ID" name={[name, "id"]}>
            <Input placeholder="e.g. HP:0001234" onBlur={handleIdBlur} />
          </Form.Item>
          <Form.Item label="Label" name={[name, "label"]}>
            <Input placeholder="Human-readable label" />
          </Form.Item>
        </>
      ) : (
        <Form.Item label="Value" name={[name, "value"]}>
          <Input />
        </Form.Item>
      )}
    </>
  );
};

const ClassificationTab = () => {
  const form = Form.useFormInstance();
  const currentResources: Record<string, unknown>[] = Form.useWatch("resources", form) ?? [];
  const existingPrefixes = new Set(currentResources.map((r) => String(r?.namespace_prefix ?? "")));

  const currentTaxa: Record<string, unknown>[] = Form.useWatch("taxa", form) ?? [];
  const existingTaxaIds = new Set(currentTaxa.map((t) => String(t?.id ?? "")));

  const grouped = COMMON_KEYWORD_PRESETS.filter((p) => p.category === "Species").reduce(
    (acc, preset) => {
      (acc[preset.category] ??= []).push(preset);
      return acc;
    },
    {} as Record<string, typeof COMMON_KEYWORD_PRESETS>,
  );

  const quickAddTaxaItems: MenuProps["items"] = Object.entries(grouped).map(([category, presets]) => ({
    key: category,
    type: "group" as const,
    label: category,
    children: presets.map((preset) => ({
      key: preset.id,
      label: `${preset.label} (${preset.id})`,
      disabled: existingTaxaIds.has(preset.id),
      onClick: () => {
        if (existingTaxaIds.has(preset.id)) return;
        const prefix = preset.id.split(":")[0];
        const ontology = COMMON_ONTOLOGIES[prefix] ?? COMMON_ONTOLOGIES[prefix.toUpperCase()];
        const updatedResources = [...currentResources];
        if (ontology && !existingPrefixes.has(ontology.namespace_prefix)) {
          updatedResources.push({ ...ontology, version: "" });
          form.setFieldValue("resources", updatedResources);
        }
        form.setFieldValue("taxa", [...currentTaxa, { type: "ontology", id: preset.id, label: preset.label }]);
      },
    })),
  }));

  const quickAddItems: MenuProps["items"] = Object.entries(COMMON_ONTOLOGIES).map(([prefix, ontology]) => ({
    key: prefix,
    label: `${ontology.namespace_prefix} — ${ontology.name}`,
    disabled: existingPrefixes.has(ontology.namespace_prefix),
    onClick: () => {
      if (existingPrefixes.has(ontology.namespace_prefix)) return;
      form.setFieldValue("resources", [...currentResources, { ...ontology, version: "" }]);
    },
  }));

  return (
    <>
      <Card title="Keywords" size="small" style={{ marginBottom: 8 }}>
        <Form.List name="keywords">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Card key={key} size="small" style={{ marginBottom: 8 }}>
                  <OntologyFields listName="keywords" name={name} />
                  <Button danger size="small" onClick={() => remove(name)} style={{ marginTop: 4 }}>
                    Remove
                  </Button>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ type: "string" })} icon={<PlusOutlined />}>
                Add keyword
              </Button>
              <Button
                type="dashed"
                onClick={() => add({ type: "ontology" })}
                icon={<PlusOutlined />}
                style={{ marginLeft: 8 }}
              >
                Add ontology keyword
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      <Card title="Taxonomy" size="small" style={{ marginBottom: 8 }}>
        <Form.List name="taxa">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Card key={key} size="small" style={{ marginBottom: 8 }}>
                  <OntologyFields listName="taxa" name={name} />
                  <Button danger size="small" onClick={() => remove(name)} style={{ marginTop: 4 }}>
                    Remove
                  </Button>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ type: "string" })} icon={<PlusOutlined />}>
                Add taxonomy entry
              </Button>
              <Button
                type="dashed"
                onClick={() => add({ type: "ontology" })}
                icon={<PlusOutlined />}
                style={{ marginLeft: 8 }}
              >
                Add ontology taxonomy
              </Button>
              <Dropdown menu={{ items: quickAddTaxaItems }}>
                <Button type="dashed" icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
                  Quick add common
                </Button>
              </Dropdown>
            </>
          )}
        </Form.List>
      </Card>

      <Card title="Ontology Resources" size="small" style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          Ontology resources needed to resolve CURIEs in keywords and taxonomy.
        </Text>
        <Form.List name="resources">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Card key={key} size="small" style={{ marginBottom: 8 }}>
                  <Form.Item label="ID" name={[name, "id"]} rules={[{ required: true, min: 1 }]}>
                    <Input placeholder="e.g. hp" />
                  </Form.Item>
                  <Form.Item label="Name" name={[name, "name"]} rules={[{ required: true, min: 1 }]}>
                    <Input placeholder="e.g. Human Phenotype Ontology" />
                  </Form.Item>
                  <Form.Item label="URL" name={[name, "url"]} rules={[{ required: true, type: "url" }]}>
                    <Input placeholder="https://purl.obolibrary.org/obo/hp.owl" />
                  </Form.Item>
                  <Form.Item
                    label="Namespace prefix"
                    name={[name, "namespace_prefix"]}
                    rules={[{ required: true, min: 1 }]}
                  >
                    <Input placeholder="e.g. HP" />
                  </Form.Item>
                  <Form.Item label="IRI prefix" name={[name, "iri_prefix"]} rules={[{ required: true, type: "url" }]}>
                    <Input placeholder="e.g. http://purl.obolibrary.org/obo/HP_" />
                  </Form.Item>
                  <Form.Item label="Version" name={[name, "version"]} rules={[{ required: true, min: 1 }]}>
                    <Input placeholder="e.g. 2024-04-26" />
                  </Form.Item>
                  <Form.Item label="Repository URL" name={[name, "repository_url"]} rules={[{ type: "url" }]}>
                    <Input placeholder="https://github.com/..." />
                  </Form.Item>
                  <Button danger size="small" onClick={() => remove(name)}>
                    Remove
                  </Button>
                </Card>
              ))}
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add ontology resource
                </Button>
                <Dropdown menu={{ items: quickAddItems }}>
                  <Button type="dashed" icon={<PlusOutlined />}>
                    Quick add common
                  </Button>
                </Dropdown>
              </div>
            </>
          )}
        </Form.List>
      </Card>

      <LicenseSection />

      <Card title="Spatial Coverage" size="small">
        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          Provide a place name string or a GeoJSON Feature (as JSON).
        </Text>
        <Form.Item label="Coverage (string)" name="spatial_coverage">
          <Input placeholder="e.g. Canada, North America" />
        </Form.Item>
      </Card>
    </>
  );
};

export default ClassificationTab;
