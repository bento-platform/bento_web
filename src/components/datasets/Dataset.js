import { useCallback, useEffect, useState } from "react";

import { Button, Card, Col, Divider, Empty, Modal, Row, Typography } from "antd";

import DataUseDisplay from "../DataUseDisplay";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import {
  addDatasetLinkedFieldSetIfPossible,
  deleteProjectDatasetIfPossible,
  deleteDatasetLinkedFieldSetIfPossible,
} from "@/modules/metadata/actions";

import { fetchDatasetDataTypesIfPossible, fetchDatasetSummariesIfNeeded } from "@/modules/datasets/actions";

import { INITIAL_DATA_USE_VALUE } from "@/duo";
import { nop } from "@/utils/misc";
import LinkedFieldSetTable from "./linked_field_set/LinkedFieldSetTable";
import LinkedFieldSetModal from "./linked_field_set/LinkedFieldSetModal";
import { FORM_MODE_ADD, FORM_MODE_EDIT } from "@/constants";

import DatasetOverview from "./DatasetOverview";
import DatasetDataTypes from "./DatasetDataTypes";
import { useAppDispatch } from "@/store";

const DATASET_CARD_TABS = [
  { key: "overview", tab: "Overview" },
  { key: "data_types", tab: "Data Types" },
  { key: "linked_field_sets", tab: "Linked Field Sets" },
  { key: "data_use", tab: "Consent Codes and Data Use" },
];

const DEFAULT_BIOSAMPLE_LFS = {
  name: "BIO_SAMPLE_LFS",
  fields: {
    variant: ["calls", "[item]", "sample_id"],
    experiment: ["biosample"],
    phenopacket: ["biosamples", "[item]", "id"],
  },
};

export default ({ mode, project, value, onEdit }) => {
  const dispatch = useAppDispatch();

  const identifier = value?.identifier ?? null;
  const title = value?.title ?? "";
  const linkedFieldSets = value?.linked_field_sets ?? [];
  const dataUse = value?.data_use ?? INITIAL_DATA_USE_VALUE;

  const [fieldSetAdditionModalVisible, setFieldSetAdditionModalVisible] = useState(false);
  const [fieldSetEditModalVisible, setFieldSetEditModalVisible] = useState(false);
  const [selectedLinkedFieldSet, setSelectedLinkedFieldSet] = useState({ data: null, index: null });
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (identifier) {
      dispatch(fetchDatasetSummariesIfNeeded(identifier));
      dispatch(fetchDatasetDataTypesIfPossible(identifier));
    }
  }, [dispatch, identifier]);

  const handleFieldSetDeletion = useCallback(
    (fieldSet, index) => {
      const deleteModal = Modal.confirm({
        title: `Are you sure you want to delete the "${fieldSet.name}" linked field set?`,
        content: (
          <>
            <Typography.Paragraph>
              Doing so will mean users will <strong>no longer</strong> be able to link search results across the data
              types specified via the following linked fields:
            </Typography.Paragraph>
            <LinkedFieldSetTable linkedFieldSet={fieldSet} />
          </>
        ),
        width: 720,
        autoFocusButton: "cancel",
        okText: "Delete",
        okType: "danger",
        maskClosable: true,
        onOk: async () => {
          deleteModal.update({ okButtonProps: { loading: true } });
          await dispatch(deleteDatasetLinkedFieldSetIfPossible(value, fieldSet, index));
          deleteModal.update({ okButtonProps: { loading: false } });
        },
      });
    },
    [dispatch, value],
  );

  const handleDelete = useCallback(() => {
    const deleteModal = Modal.confirm({
      title: `Are you sure you want to delete the "${title}" dataset?`,
      content: (
        <>
          <Typography.Paragraph>
            All data contained in the dataset will be deleted permanently, and the dataset will no longer be available
            for exploration.
          </Typography.Paragraph>
        </>
      ),
      width: 572,
      autoFocusButton: "cancel",
      okText: "Delete",
      okType: "danger",
      maskClosable: true,
      onOk: async () => {
        deleteModal.update({ okButtonProps: { loading: true } });
        await dispatch(deleteProjectDatasetIfPossible(project, value));
        deleteModal.update({ okButtonProps: { loading: false } });
      },
    });
  }, [dispatch, project, title, value]);

  const isPrivate = mode === "private";
  const defaultBiosampleLFSDisabled = linkedFieldSets.length !== 0;

  const tabContents = {
    overview: <DatasetOverview dataset={value} project={project} isPrivate={isPrivate} />,
    data_types: <DatasetDataTypes dataset={value} project={project} isPrivate={isPrivate} />,
    linked_field_sets: (
      <>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Linked Field Sets
          {isPrivate ? (
            <div style={{ float: "right", display: "flex", flexDirection: "column", gap: "10px" }}>
              <Button
                icon={<PlusOutlined />}
                style={{ verticalAlign: "top" }}
                type="primary"
                onClick={() => setFieldSetAdditionModalVisible(true)}
              >
                Add Linked Field Set
              </Button>
              <Button
                icon={<PlusOutlined />}
                style={{ verticalAlign: "top" }}
                type="default"
                disabled={defaultBiosampleLFSDisabled}
                onClick={() => dispatch(addDatasetLinkedFieldSetIfPossible(value, DEFAULT_BIOSAMPLE_LFS))}
              >
                Default Biosample Field Set
              </Button>
            </div>
          ) : null}
        </Typography.Title>
        <Typography.Paragraph style={{ maxWidth: "600px" }}>
          Linked Field Sets group common fields (i.e. fields that share the same &ldquo;value space&rdquo;) between
          multiple data types. For example, these sets can be used to tell the data exploration system that
          Phenopacket biosample identifiers are the same as variant call sample identifiers, and so variant calls with
          an identifier of &ldquo;sample1&rdquo; come from a biosample with identifier &ldquo;sample1&rdquo;.
        </Typography.Paragraph>
        <Typography.Paragraph style={{ maxWidth: "600px" }}>
          A word of caution: the more fields added to a Linked Field Set, the longer it takes to search the dataset in
          question.
        </Typography.Paragraph>
        {linkedFieldSets.length === 0 ? (
          <>
            <Divider />
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Field Link Sets">
              {isPrivate ? (
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setFieldSetAdditionModalVisible(true)}
                >
                  Add Field Link Set
                </Button>
              ) : null}
            </Empty>
          </>
        ) : (
          <Row gutter={[16, 24]}>
            {linkedFieldSets.map((fieldSet, i) => (
              <Col key={i} lg={24} xl={12}>
                <Card
                  title={`${i + 1}. ${fieldSet.name}`}
                  actions={
                    isPrivate
                      ? [
                          <span
                            key="edit"
                            onClick={() => {
                              setSelectedLinkedFieldSet({ data: fieldSet, index: i });
                              setFieldSetEditModalVisible(true);
                            }}
                          >
                            <EditOutlined style={{ width: "auto", display: "inline" }} /> Manage Fields
                          </span>,
                          <span key="delete" onClick={() => handleFieldSetDeletion(fieldSet, i)}>
                            <DeleteOutlined style={{ width: "auto", display: "inline" }} /> Delete Set
                          </span>,
                        ]
                      : []
                  }
                >
                  <LinkedFieldSetTable linkedFieldSet={fieldSet} />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </>
    ),
    data_use: <DataUseDisplay dataUse={dataUse} />,
  };

  return (
    <Card
      key={identifier}
      title={
        <span id={`dataset-${identifier}`}>
          {title}{" "}
          <span
            style={{
              fontStyle: "italic",
              fontWeight: "normal",
              fontSize: "0.8em",
              fontFamily: "monospace",
              marginLeft: "0.8em",
              color: "#8c8c8c", // Ant Design gray-7
            }}
          >
            {identifier}
          </span>
        </span>
      }
      tabList={DATASET_CARD_TABS}
      activeTabKey={selectedTab}
      tabProps={{ size: "middle" }}
      onTabChange={setSelectedTab}
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      extra={
        isPrivate ? (
          <>
            <Button
              icon={<EditOutlined />}
              style={{ marginRight: "8px" }}
              onClick={() => (onEdit || nop)()}
            >
              Edit
            </Button>
            <Button danger={true} icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
            {/* TODO: Share button (vFuture) */}
          </>
        ) : null
      }
    >
      {isPrivate ? (
        <>
          <LinkedFieldSetModal
            mode={FORM_MODE_ADD}
            dataset={value}
            open={fieldSetAdditionModalVisible}
            onSubmit={() => setFieldSetAdditionModalVisible(false)}
            onCancel={() => setFieldSetAdditionModalVisible(false)}
          />

          <LinkedFieldSetModal
            mode={FORM_MODE_EDIT}
            dataset={value}
            open={fieldSetEditModalVisible}
            linkedFieldSet={selectedLinkedFieldSet.data}
            linkedFieldSetIndex={selectedLinkedFieldSet.index}
            onSubmit={() => setFieldSetEditModalVisible(false)}
            onCancel={() => setFieldSetEditModalVisible(false)}
          />
        </>
      ) : null}
      {tabContents[selectedTab]}
    </Card>
  );
};
