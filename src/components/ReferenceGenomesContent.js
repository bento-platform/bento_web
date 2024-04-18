import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import { Button, Descriptions, Dropdown, Layout, Modal, Popover, Space, Table } from "antd";
import { BarsOutlined, DeleteOutlined, ImportOutlined } from "@ant-design/icons";

import { deleteReferenceMaterial, ingestReferenceMaterial, RESOURCE_EVERYTHING } from "bento-auth-js";

import { useResourcePermissionsWrapper, useWorkflows } from "@/hooks";
import { deleteReferenceGenomeIfPossible } from "@/modules/reference/actions";
import { useReferenceGenomes } from "@/modules/reference/hooks";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";
import SitePageHeader from "./SitePageHeader";
import { useStartIngestionFlow } from "./manager/workflowCommon";
import MonospaceText from "@/components/common/MonospaceText";
import OntologyTerm from "@/components/explorer/OntologyTerm";

const DEFAULT_REF_INGEST_WORKFLOW_ID = "fasta_ref";

const ReferenceGenomesContent = () => {
    const dispatch = useDispatch();

    const { permissions } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    const canIngestReference = permissions.includes(ingestReferenceMaterial);
    const canDeleteReference = permissions.includes(deleteReferenceMaterial);

    const { items: genomes, isFetching: isFetchingGenomes, hasAttempted, isDeletingIDs } = useReferenceGenomes();

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
            title: "Taxon",
            dataIndex: "taxon",
            render: (taxon) => <OntologyTerm term={taxon} renderLabel={(label) => <em>{label}</em>} />,
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
        ...(canDeleteReference ? [
            {
                title: "Actions",
                key: "actions",
                render: (genome) => (
                    <Space>
                        <Popover title={`Reference Genome: ${genome.id}`} content={
                            <Descriptions layout="horizontal" bordered={true} column={1} size="small">
                                <Descriptions.Item label="Checksums">
                                    <strong>MD5:</strong>&nbsp;<MonospaceText>{genome.md5}</MonospaceText><br />
                                    <strong>GA4GH:</strong>&nbsp;<MonospaceText>{genome.ga4gh}</MonospaceText>
                                </Descriptions.Item>
                            </Descriptions>
                        }>
                            <Button icon={<BarsOutlined />}>Details</Button>
                        </Popover>
                        {canDeleteReference && (
                            <Button
                                danger={true}
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
                                }}
                            >Delete</Button>
                        )}
                        </Space>
                ),
            },
        ] : []),
    ], [dispatch, isFetchingGenomes, isDeletingIDs, canDeleteReference]);

    return <>
        <SitePageHeader title="Reference Genomes" />
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                {canIngestReference && (
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
                )}
                <Table
                    columns={columns}
                    dataSource={genomes}
                    size="middle"
                    bordered={true}
                    pagination={false}
                    loading={!hasAttempted || isFetchingGenomes}
                    rowKey="id"
                />
            </Layout.Content>
        </Layout>
    </>;
};

export default ReferenceGenomesContent;
