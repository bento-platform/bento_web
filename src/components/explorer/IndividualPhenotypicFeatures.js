import React, { useMemo } from "react";

import { Icon, Table } from "antd";

import { EM_DASH } from "../../constants";
import { individualPropTypesShape } from "../../propTypes";
import OntologyTerm from "./OntologyTerm";

const IndividualPhenotypicFeatures = ({ individual }) => {
    const columns = useMemo(() => [
        {
            title: "Feature",
            key: "feature",
            render: ({ header, type, negated }) => ({
                children: header ? (
                    <h4 style={{ marginBottom: 0 }} className="phenotypic-features--phenopacket-header">
                        Phenopacket:{" "}
                        <span style={{ fontFamily: "monospace", fontStyle: "italic", fontWeight: "normal" }}>
                            {header}
                        </span>
                    </h4>
                ) : <>
                    <OntologyTerm term={type} />{" "}
                    {negated ? (
                        <span style={{ color: "#CC3333" }}>
                            (<span style={{ fontWeight: "bold" }}>Excluded:</span>{" "}
                            Found to be absent{" "}
                            <a href="https://phenopacket-schema.readthedocs.io/en/2.0.0/phenotype.html#excluded"
                               target="_blank"
                               rel="noopener noreferrer">
                                <Icon type="link" />
                            </a>)
                        </span>
                    ) : null}
                </>,
                props: {
                    colSpan: header ? 2 : 1,
                },
            }),
        },
        {
            title: "Extra Properties",
            dataIndex: "extra_properties",
            render: (extraProperties, feature) => {
                const nExtraProperties = Object.keys(extraProperties ?? {}).length;
                return {
                    children: nExtraProperties ? (
                        <div>
                            <pre style={{marginBottom: 0, fontSize: "12px"}}>
                                {JSON.stringify(
                                    extraProperties,
                                    null,
                                    nExtraProperties === 1 ? null : 2,
                                )}
                            </pre>
                        </div>
                    ) : EM_DASH,   // If no extra properties, just show a dash
                    props: {
                        colSpan: feature.header ? 0 : 1,
                    },
                };
            },
        },

    ], []);

    const data = useMemo(() => {
        const phenopackets = (individual?.phenopackets ?? []);
        return phenopackets.flatMap((p) => [
            ...(phenopackets.length > 1 ? [{
                header: p.id,
                key: p.id,
            }] : []),  // If there is just 1 phenopacket, don't include a header row
            ...(p.phenotypic_features ?? []).map((pf) => ({
                ...pf,
                key: `${p.id}:${pf.type.id}:${pf.negated}`,
            })),
        ]);
    }, [individual]);

    return (
        <Table
            className="phenotypic-features-table"
            bordered
            size="middle"
            pagination={false}
            columns={columns}
            rowKey="key"
            dataSource={data}
        />
    );
};

IndividualPhenotypicFeatures.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualPhenotypicFeatures;
