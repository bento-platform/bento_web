import React from "react";
import { Button, Table } from "antd";

import { useReferenceGenomes } from "../../../modules/reference/hooks";

const REFERENCE_GENOME_COLUMNS = [
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
                <strong>FASTA:</strong>&nbsp;{genome.fasta}<br />
                <strong>FAI:</strong>&nbsp;{genome.fai}
            </div>
        ),
    },
    {
        title: "Actions",
        key: "actions",
        render: (genome) => (
            <Button type="danger" icon="delete" onClick={() => {
                console.debug("TODO: delete", genome);
            }}>Delete</Button>
        ),
    }
];

const ManagerReferenceGenomesContent = () => {
    const referenceGenomes = useReferenceGenomes();  // Reference service genomes

    return (
        <Table
            columns={REFERENCE_GENOME_COLUMNS}
            size="middle"
            dataSource={referenceGenomes.items}
            loading={referenceGenomes.isFetching}
        />
    );
};

export default ManagerReferenceGenomesContent;
