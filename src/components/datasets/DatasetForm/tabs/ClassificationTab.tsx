import { Button, Card, Form, Input, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ClassificationTab = () => (
  <>
    <Card title="Keywords" style={{ marginBottom: 16 }}>
      <Form.List name="keywords">
        {(fields, { add, remove }) => (
          <>
            <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
              Each keyword can be a plain string or an OntologyClass (id + optional label).
            </Text>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Form.Item label="Keyword (string)" name={[name, "value"]}>
                  <Input placeholder="Plain keyword text" />
                </Form.Item>
                <Text type="secondary">— or as OntologyClass —</Text>
                <Form.Item label="Ontology ID" name={[name, "id"]} style={{ marginTop: 8 }}>
                  <Input placeholder="e.g. HP:0001234" />
                </Form.Item>
                <Form.Item label="Label" name={[name, "label"]}>
                  <Input placeholder="Human-readable label" />
                </Form.Item>
                <Button danger size="small" onClick={() => remove(name)}>
                  Remove
                </Button>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
              Add keyword
            </Button>
          </>
        )}
      </Form.List>
    </Card>

    <Card title="Taxonomy" style={{ marginBottom: 16 }}>
      <Form.List name="taxonomy">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Form.Item label="String value" name={[name, "value"]}>
                  <Input placeholder="Plain text taxonomy entry" />
                </Form.Item>
                <Text type="secondary">— or as OntologyClass —</Text>
                <Form.Item label="Ontology ID" name={[name, "id"]} style={{ marginTop: 8 }}>
                  <Input placeholder="e.g. NCIT:C12345" />
                </Form.Item>
                <Form.Item label="Label" name={[name, "label"]}>
                  <Input placeholder="Human-readable label" />
                </Form.Item>
                <Button danger size="small" onClick={() => remove(name)}>
                  Remove
                </Button>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
              Add taxonomy entry
            </Button>
          </>
        )}
      </Form.List>
    </Card>

    <Card title="Ontology Resources" style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        Ontology resources needed to resolve CURIEs in keywords and taxonomy.
      </Text>
      <Form.List name="resources">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Form.Item
                  label="Namespace prefix"
                  name={[name, "namespace_prefix"]}
                  rules={[{ required: true, min: 1 }]}
                >
                  <Input placeholder="e.g. HP" />
                </Form.Item>
                <Form.Item label="Name" name={[name, "name"]}>
                  <Input placeholder="Human Phenotype Ontology" />
                </Form.Item>
                <Form.Item label="Version" name={[name, "version"]}>
                  <Input placeholder="e.g. 2024-01-01" />
                </Form.Item>
                <Form.Item label="URL" name={[name, "url"]}>
                  <Input placeholder="https://..." />
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

    <Card title="License" style={{ marginBottom: 16 }}>
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

    <Card title="Spatial Coverage">
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
