import React, { useMemo } from "react";

import { Table } from "antd";
import { LinkOutlined } from "@ant-design/icons";

import { EM_DASH } from "@/constants";
import { individualPropTypesShape, phenopacketPropTypesShape, phenotypicFeaturePropTypesShape } from "@/propTypes";
import OntologyTerm from "./OntologyTerm";
import { booleanFieldSorter, renderBoolean } from "./utils";
import TimeElement from "./TimeElement";
import { Descriptions } from "../../../node_modules/antd/lib/index";
import { RoutedIndividualContentTable } from "./RoutedIndividualContent";

const PHENOTYPIC_FEATURES_COLUMNS = [
    {
        title: "Feature",
        key: "feature",
        render: ({ header, type, excluded }) => ({
            children: header ? (
                <h4 style={{ marginBottom: 0 }} className="phenotypic-features--phenopacket-header">
                    Phenopacket:{" "}
                    <span style={{ fontFamily: "monospace", fontStyle: "italic", fontWeight: "normal" }}>
                        {header}
                    </span>
                </h4>
            ) : <>
                <OntologyTerm term={type} />{" "}
                {excluded ? (
                    <span style={{ color: "#CC3333" }}>
                        (<span style={{ fontWeight: "bold" }}>Excluded:</span>{" "}
                        Found to be absent{" "}
                        <a href="https://phenopacket-schema.readthedocs.io/en/2.0.0/phenotype.html#excluded"
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOutlined />
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
        title: "Excluded",
        key: "excluded",
        render: renderBoolean("excluded"),
        sorter: booleanFieldSorter("excluded"),
    },
    {
        title: "Severity",
        key: "severity",
        render: (_, feature) => <OntologyTerm term={feature?.severity} />
    },
    {
        title: "Modifiers",
        key: "modifiers",
        render: (_, feature) => {
            if (Array.isArray(feature?.modifiers)) {
                return feature.modifiers.map(mod => <OntologyTerm term={mod} br />)
            }
            return EM_DASH;
        }
    },
    {
        title: "Onset",
        key: "onset",
        render: (_, feature) => <TimeElement timeElement={feature?.onset} />
    },
    {
        title: "Resolution",
        key: "resolution",
        render: (_, feature) => <TimeElement timeElement={feature?.resolution} />
    },
    {
        title: "Extra Properties",
        dataIndex: "extra_properties",
        render: (extraProperties, feature) => {
            const nExtraProperties = Object.keys(extraProperties ?? {}).length;
            return {
                children: nExtraProperties ? (
                    <div>
                        <pre style={{ marginBottom: 0, fontSize: "12px" }}>
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
];

const PhenotypicFeatureDetail = ({ pf, handleFeatureClick }) => {
    const description = pf?.description ?? "";
    const modifiers = pf?.modifiers ?? [];
    const evidence = pf?.evidence ?? [];
    return (
        <Descriptions bordered={true} column={1} size="small">
            <Descriptions.Item label="Description">
                {description}
            </Descriptions.Item>
            <Descriptions.Item label="Modifiers">
                {modifiers ? modifiers.map(modifier => <OntologyTerm term={modifier} br />) : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Evidence">
                {evidence ? evidence.map(evidence => <OntologyTerm term={evidence} br />) : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Extra Properties">
                {pf.hasOwnProperty("extra_properties") &&
                    Object.keys(pf.extra_properties).length ? (
                    <JsonView src={pf.extra_properties} />
                ) : (
                    EM_DASH
                )}
            </Descriptions.Item>
        </Descriptions>

    );
};
PhenotypicFeatureDetail.propTypes = {
    pf: phenotypicFeaturePropTypesShape,
    handleFeatureClick: PropTypes.func,
};

const PhenotypicFeatures = ({phenotypicFeatures, handleSelect}) => (
    <RoutedIndividualContentTable
        data={phenotypicFeatures}
        urlParam="selectedPhenotypicFeature"
        columns={PHENOTYPIC_FEATURES_COLUMNS}
        rowKey="key"
        handleRowSelect={handleSelect}
        expandedRowRender={(phenotypicFeature) => (
            <PhenotypicFeatureDetail pf={phenotypicFeature}/>
        )} 
    />
);
PhenotypicFeatures.propTypes = {
    phenotypicFeature: phenopacketPropTypesShape,
    handleSelect: PropTypes.func,
};

const IndividualPhenotypicFeatures = ({ individual }) => {

    const data = useMemo(() => {
        const phenopackets = (individual?.phenopackets ?? []);
        return phenopackets.flatMap((p) => [
            ...(phenopackets.length > 1 ? [{
                header: p.id,
                key: p.id,
            }] : []),  // If there is just 1 phenopacket, don't include a header row
            ...(p.phenotypic_features ?? []).map((pf) => ({
                ...pf,
                key: `${p.id}:${pf.type.id}:${pf.excluded}`,
            })),
        ]);
    }, [individual]);

    return (
        <Table
            className="phenotypic-features-table"
            bordered
            size="middle"
            pagination={false}
            columns={PHENOTYPIC_FEATURES_COLUMNS}
            rowKey="key"
            dataSource={data}
        />
    );
};

IndividualPhenotypicFeatures.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualPhenotypicFeatures;
