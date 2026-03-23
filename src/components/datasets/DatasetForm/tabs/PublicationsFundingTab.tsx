import React from "react";
import { Button, Card, Collapse, DatePicker, Form, Input, Select, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import { publicationTypeOptions } from "../constants";
import PersonOrOrganizationFields from "../fields/PersonOrOrganizationFields";
import PublicationVenueFields from "../fields/PublicationVenueFields";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const PublicationsFundingTab: React.FC<{ form: FormInstance }> = ({ form }) => (
  <>
    <Card title="Publications" style={{ marginBottom: 16 }}>
      <Form.List name="publications">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" title={`Publication ${name + 1}`} style={{ marginBottom: 8 }}>
                <Form.Item label="Title" name={[name, "title"]} rules={[{ required: true, min: 1 }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="URL" name={[name, "url"]} rules={[{ required: true, type: "url" }]}>
                  <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item label="DOI" name={[name, "doi"]}>
                  <Input placeholder="10.xxxx/xxxxx" />
                </Form.Item>
                <Form.Item label="Publication type" name={[name, "publication_type"]} rules={[{ required: true }]}>
                  <Select placeholder="Select type" allowClear>
                    {publicationTypeOptions.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                    <Option value="__other">Other (specify)</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) => {
                    const p = prev?.publications?.[name]?.publication_type;
                    const c = cur?.publications?.[name]?.publication_type;
                    return p !== c;
                  }}
                >
                  {({ getFieldValue }) =>
                    getFieldValue(["publications", name, "publication_type"]) === "__other" ? (
                      <Form.Item label="Other publication type" name={[name, "publication_type_other"]}>
                        <Input placeholder="Specify type" />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
                <Form.Item label="Publication date" name={[name, "publication_date"]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Description" name={[name, "description"]}>
                  <TextArea rows={2} />
                </Form.Item>

                <Collapse ghost>
                  <Panel header="Venue" key="venue">
                    <PublicationVenueFields namePrefix={[name, "publication_venue"]} absoluteNamePrefix={["publications", name, "publication_venue"]} />
                  </Panel>
                  <Panel header="Authors" key="authors">
                    <Form.List name={[name, "authors"]}>
                      {(authorFields, { add: addAuthor, remove: removeAuthor }) => (
                        <>
                          {authorFields.map(({ key: aKey, name: aName }) => (
                            <div key={aKey} style={{ position: "relative" }}>
                              <PersonOrOrganizationFields
                                namePrefix={[aName]}
                                absoluteNamePrefix={["publications", name, "authors", aName]}
                                form={form}
                              />
                              <Button
                                danger
                                size="small"
                                onClick={() => removeAuthor(aName)}
                                style={{ position: "absolute", top: 8, right: 8 }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => addAuthor({ type: "person" })}
                            icon={<PlusOutlined />}
                            size="small"
                            style={{ marginLeft: 8 }}
                          >
                            Add author
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Panel>
                </Collapse>

                <div style={{ marginTop: 8 }}>
                  <Button danger size="small" onClick={() => remove(name)}>
                    Remove publication
                  </Button>
                </div>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
              Add publication
            </Button>
          </>
        )}
      </Form.List>
    </Card>

    <Card title="Funding Sources">
      <Form.List name="funding_sources">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Form.Item label="Funder name" name={[name, "funder"]}>
                  <Input placeholder="Funding organization or person name" />
                </Form.Item>
                <Form.List name={[name, "grant_numbers"]}>
                  {(grantFields, { add: addGrant, remove: removeGrant }) => (
                    <>
                      <Text strong>Grant numbers</Text>
                      {grantFields.map(({ key: gKey, name: gName, ...gRest }) => (
                        <Space key={gKey} align="baseline" style={{ display: "flex", marginBottom: 4 }}>
                          <Form.Item {...gRest} name={gName}>
                            <Input placeholder="Grant number" style={{ width: 300 }} />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => removeGrant(gName)} />
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => addGrant()}
                        icon={<PlusOutlined />}
                        size="small"
                        style={{ marginLeft: 8 }}
                      >
                        Add grant number
                      </Button>
                    </>
                  )}
                </Form.List>
                <div style={{ marginTop: 8 }}>
                  <Button danger size="small" onClick={() => remove(name)}>
                    Remove source
                  </Button>
                </div>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ marginLeft: 8 }}>
              Add funding source
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  </>
);

export default PublicationsFundingTab;
