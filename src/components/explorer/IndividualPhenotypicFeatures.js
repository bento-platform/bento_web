import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { LinkOutlined } from "@ant-design/icons";

import JsonView from "@/components/JsonView";
import { EM_DASH } from "@/constants";
import {
    evidencePropTypesShape,
    individualPropTypesShape,
    phenotypicFeaturePropTypesShape,
} from "@/propTypes";
import OntologyTerm, { conditionalOntologyRender } from "./OntologyTerm";
import { booleanFieldSorter, renderBoolean } from "./utils";
import TimeElement from "./TimeElement";
import { Descriptions } from "../../../node_modules/antd/lib/index";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import { isValidUrl } from "@/utils/url";

const PHENOTYPIC_FEATURES_COLUMNS = [
    {
        title: "Feature",
        key: "feature",
        render: ({ header, type, excluded }) => (
            header ? (
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
            </>
        ),
        onCell: ({ header }) => ({
            colSpan: header ? 2 : 1,
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
        render: conditionalOntologyRender("severity"),
    },
    {
        title: "Onset",
        dataIndex: "onset",
        render: (onset) => <TimeElement timeElement={onset} />,
    },
    {
        title: "Resolution",
        dataIndex: "resolution",
        render: (resolution) => <TimeElement timeElement={resolution} />,
    },
];


const Evidence = ({ evidence }) => {
    if (!evidence) {
        return EM_DASH;
    }

    const externalReference = evidence?.reference;
    const hasReferenceUrl = isValidUrl(externalReference?.reference);
    return (
        <Descriptions bordered={false} column={1} size="small">
            <Descriptions.Item label="Evidence Code">
                <OntologyTerm term={evidence.evidence_code} />
            </Descriptions.Item>
            {externalReference &&
                <Descriptions.Item label="Reference">
                    <div>
                        {externalReference?.id &&
                            <>
                                <strong>ID:</strong>{" "}{externalReference.id}{" "}
                                {hasReferenceUrl &&
                                    <a href={externalReference.reference} target="_blank" rel="noopener noreferrer">
                                        <LinkOutlined/>
                                    </a>
                                }
                                <br />
                            </>
                        }
                        {externalReference?.description &&
                            <>
                                <strong>description:</strong>{" "}{externalReference?.description}
                                <br />
                            </>
                        }
                    </div>
                </Descriptions.Item>
            }
        </Descriptions>
    );
};
Evidence.propTypes = {
    evidence: evidencePropTypesShape,
};

const PhenotypicFeatureDetail = ({ pf }) => {
    const description = pf?.description;
    const modifiers = pf?.modifiers ?? [];
    const evidence = pf?.evidence ?? [];
    return (
        <Descriptions bordered={true} column={1} size="small">
            <Descriptions.Item label="Description">
                {description ? description : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Modifiers">
                {modifiers.length
                    ? modifiers.map((modifier, idx) => <OntologyTerm term={modifier} key={idx} br />)
                    : EM_DASH
                }
            </Descriptions.Item>
            <Descriptions.Item label="Evidence">
                {evidence.length
                    // ? evidence.map(evidence => <OntologyTerm term={evidence} br />)
                    ? evidence.map((evidence, idx) => <Evidence evidence={evidence} key={idx} />)
                    : EM_DASH
                }
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

const PhenotypicFeatures = ({ phenotypicFeatures, handleSelect }) => (
    <RoutedIndividualContentTable
        data={phenotypicFeatures}
        urlParam="selectedPhenotypicFeature"
        columns={PHENOTYPIC_FEATURES_COLUMNS}
        rowKey="key"
        handleRowSelect={handleSelect}
        expandedRowRender={(phenotypicFeature) => (
            <PhenotypicFeatureDetail pf={phenotypicFeature} />
        )}
    />
);
PhenotypicFeatures.propTypes = {
    phenotypicFeatures: PropTypes.arrayOf(phenotypicFeaturePropTypesShape),
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
        <RoutedIndividualContent
            urlParam="selectedPhenotypicFeature"
            renderContent={({ onContentSelect }) => (
                <PhenotypicFeatures
                    phenotypicFeatures={data}
                    handleSelect={onContentSelect}
                />
            )}
        />
    );
};

IndividualPhenotypicFeatures.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualPhenotypicFeatures;
