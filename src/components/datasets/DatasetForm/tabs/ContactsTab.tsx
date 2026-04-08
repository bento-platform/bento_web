import type { FC } from "react";
import { Button, Card, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import PersonOrOrganizationFields from "../fields/PersonOrOrganizationFields";
import RequiredMark from "../RequiredMark";

const ContactsTab: FC<{ form: FormInstance }> = ({ form }) => (
  <>
    <Card
      title={
        <span>
          Primary Contact <RequiredMark />
        </span>
      }
      size="small"
      style={{ marginBottom: 8 }}
    >
      <PersonOrOrganizationFields namePrefix={["primary_contact"]} form={form} />
    </Card>

    <Card
      title={
        <span>
          Stakeholders <RequiredMark />
        </span>
      }
      size="small"
    >
      <Form.List name="stakeholders">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <div key={key} style={{ position: "relative" }}>
                <PersonOrOrganizationFields
                  namePrefix={[name]}
                  absoluteNamePrefix={["stakeholders", name]}
                  form={form}
                />
                {fields.length > 1 && (
                  <Button
                    danger
                    size="small"
                    onClick={() => remove(name)}
                    style={{ position: "absolute", top: 8, right: 8 }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => add({ type: "person" })}
              icon={<PlusOutlined />}
              style={{ marginLeft: 8 }}
            >
              Add stakeholder
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  </>
);

export default ContactsTab;
