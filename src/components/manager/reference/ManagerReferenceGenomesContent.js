import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import { Button, Dropdown, Layout, Menu, Table } from "antd";

import { useReferenceGenomes } from "../../../modules/reference/hooks";
import { LAYOUT_CONTENT_STYLE } from "../../../styles/layoutContent";
import { useWorkflows } from "../../../hooks";
import { useStartIngestionFlow } from "../workflowCommon";
import { deleteReferenceGenomeIfPossible } from "../../../modules/reference/actions";

const ManagerReferenceGenomesContent = () => {
    const dispatch = useDispatch();

    const { items: genomes, isFetching: isFetchingGenomes, isDeletingIDs } = useReferenceGenomes();

    const { workflowsByType } = useWorkflows();
    const ingestionWorkflows = workflowsByType.ingestion.items;
    const ingestionWorkflowsByID = workflowsByType.ingestion.itemsByID;

    const startIngestionFlow = useStartIngestionFlow();

    const onWorkflowClick = useCallback(({ key }) => {
        startIngestionFlow(ingestionWorkflowsByID[key]);
    }, [startIngestionFlow, ingestionWorkflowsByID]);

    const onWorkflowButtonClick = useCallback(() => {
        onWorkflowClick({ key: ingestionWorkflows[0].id });
    }, [onWorkflowClick, ingestionWorkflows]);

    /** @type React.ReactNode */
    const ingestMenu = useMemo(() => (
        <Menu onClick={onWorkflowClick}>
            {ingestionWorkflows.filter((w) => (w.tags ?? []).includes("reference")).map((w) => (
                <Menu.Item key={w.id}>{w.name}</Menu.Item>
            ))}
        </Menu>
    ), [onWorkflowClick, ingestionWorkflows]);

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
                    icon="delete"
                    loading={isDeletingIDs[genome.id]}
                    disabled={isFetchingGenomes || isDeletingIDs[genome.id]}
                    onClick={() => {
                        dispatch(deleteReferenceGenomeIfPossible(genome.id));
                    }}>Delete</Button>
            ),
        },
    ], [dispatch, isFetchingGenomes, isDeletingIDs]);

    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Dropdown.Button
                    overlay={ingestMenu}
                    onClick={onWorkflowButtonClick}
                    disabled={!ingestionWorkflows.length}
                    style={{ marginBottom: "1rem" }}
                >
                    Ingest Genome
                </Dropdown.Button>
                <Table
                    columns={columns}
                    dataSource={genomes}
                    size="middle"
                    bordered={true}
                    pagination={false}
                    loading={isFetchingGenomes}
                />
            </Layout.Content>
        </Layout>
    );
};

export default ManagerReferenceGenomesContent;
