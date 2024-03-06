import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import { Button, Dropdown, Layout, Modal, Table } from "antd";
import { DeleteOutlined, ImportOutlined } from "@ant-design/icons";

import { useReferenceGenomes } from "../../../modules/reference/hooks";
import { LAYOUT_CONTENT_STYLE } from "../../../styles/layoutContent";
import { useWorkflows } from "../../../hooks";
import { useStartIngestionFlow } from "../workflowCommon";
import { deleteReferenceGenomeIfPossible } from "../../../modules/reference/actions";

const DEFAULT_REF_INGEST_WORKFLOW_ID = "fasta_ref";

const ManagerReferenceGenomesContent = () => {
    const dispatch = useDispatch();

    const { items: genomes, isFetching: isFetchingGenomes, isDeletingIDs } = useReferenceGenomes();

    const { workflowsByType, workflowsLoading } = useWorkflows();
    const ingestionWorkflows = workflowsByType.ingestion.items;
    const ingestionWorkflowsByID = workflowsByType.ingestion.itemsByID;

    const referenceIngestionWorkflows = useMemo(
        () => ingestionWorkflows.filter((w) => (w.tags ?? []).includes("reference")), [ingestionWorkflows]);

    // Fallback: if our chosen default isn't available, use the first available reference-tagged ingestion workflow.
    const defaultIngestionWorkflow = ingestionWorkflowsByID[DEFAULT_REF_INGEST_WORKFLOW_ID]
        ?? referenceIngestionWorkflows[0];

    const startIngestionFlow = useStartIngestionFlow();

    const onWorkflowClick = useCallback(({ key }) => {
        startIngestionFlow(ingestionWorkflowsByID[key]);
    }, [startIngestionFlow, ingestionWorkflowsByID]);

    const onWorkflowButtonClick = useCallback(() => {
        if (!defaultIngestionWorkflow) return;
        onWorkflowClick({ key: defaultIngestionWorkflow.id });
    }, [onWorkflowClick, defaultIngestionWorkflow]);

    const ingestMenu = useMemo(() => ({
        onClick: onWorkflowClick,
        items: referenceIngestionWorkflows.map((w) => ({
            key: w.id,
            label: w.name,
        })),
    }), [onWorkflowClick, referenceIngestionWorkflows]);

    const columns = useMemo(() => [
        {
            title: "ID",
            dataIndex: "id",
        },
        {
            title: "Checksums",
            key: "checksums",
            render: (genome) => (
                <div>
                    <strong>MD5:</strong>&nbsp;{genome.md5}<br />
                    <strong>GA4GH:</strong>&nbsp;{genome.ga4gh}<br />
                </div>
            ),
        },
        {
            title: "URIs",
            key: "uris",
            render: (genome) => (
                <div>
                    <strong>FASTA:</strong>&nbsp;<a target="_blank" rel="noopener noreferrer" href={genome.fasta}>
                        {genome.fasta}</a><br />
                    <strong>FAI:</strong>&nbsp;<a target="_blank" rel="noopener noreferrer" href={genome.fai}>
                        {genome.fai}</a>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (genome) => (
                <Button
                    type="danger"
                    icon={<DeleteOutlined />}
                    loading={isDeletingIDs[genome.id]}
                    disabled={isFetchingGenomes || isDeletingIDs[genome.id]}
                    onClick={() => {
                        Modal.confirm({
                            title: `Are you sure you want to delete genome "${genome.id}"?`,
                            maskClosable: true,
                            okText: "Delete",
                            okType: "danger",
                            // Return a promise that'll be fulfilled when the delete request goes through:
                            onOk: () => dispatch(deleteReferenceGenomeIfPossible(genome.id)),
                        });
                    }}>Delete</Button>
            ),
        },
    ], [dispatch, isFetchingGenomes, isDeletingIDs]);

    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Dropdown.Button
                    menu={ingestMenu}
                    onClick={onWorkflowButtonClick}
                    disabled={!defaultIngestionWorkflow}
                    style={{ marginBottom: "1rem" }}
                >
                    <ImportOutlined />{" "}
                    {defaultIngestionWorkflow?.name
                        ?? (workflowsLoading ? "Loading..." : "No ingestion workflows available")}
                </Dropdown.Button>
                <Table
                    columns={columns}
                    dataSource={genomes}
                    size="middle"
                    bordered={true}
                    pagination={false}
                    loading={isFetchingGenomes}
                    rowKey="id"
                />
            </Layout.Content>
        </Layout>
    );
};

export default ManagerReferenceGenomesContent;
