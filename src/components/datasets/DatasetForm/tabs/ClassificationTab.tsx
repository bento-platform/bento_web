import { Button, Card, Form, Input, Radio, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const OntologyFields = ({ listName, name }: { listName: string; name: number }) => {
  const form = Form.useFormInstance();
  const type = Form.useWatch([listName, name, "type"], form) ?? "string";

  const handleTypeChange = (e: { target: { value: string } }) => {
    if (e.target.value === "ontology") {
      form.setFieldValue([listName, name, "value"], undefined);
    } else {
      form.setFieldValue([listName, name, "id"], undefined);
      form.setFieldValue([listName, name, "label"], undefined);
    }
  };

  return (
    <>
      <Form.Item name={[name, "type"]} initialValue="string" style={{ marginBottom: 8 }}>
        <Radio.Group onChange={handleTypeChange}>
          <Radio value="string">Plain text</Radio>
          <Radio value="ontology">OntologyClass</Radio>
        </Radio.Group>
      </Form.Item>
      {type === "ontology" ? (
        <>
          <Form.Item label="Ontology ID" name={[name, "id"]}>
            <Input placeholder="e.g. HP:0001234" />
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

const ClassificationTab = () => (
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
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
              Add ontology resource
            </Button>
          </>
        )}
      </Form.List>
    </Card>

    <Card title="License" size="small" style={{ marginBottom: 8 }}>
      <Form.Item label="Label" name={["license", "label"]}>
        <Input placeholder="e.g. Creative Commons BY 4.0" />
      </Form.Item>
      <Form.Item label="Type" name={["license", "type"]}>
        <Input placeholder="e.g. CC-BY-4.0" />
      </Form.Item>
      <Form.Item label="URL" name={["license", "url"]}>
        <Input placeholder="https://creativecommons.org/licenses/by/4.0/" />
      </Form.Item>
    </Card>

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

export default ClassificationTab;
