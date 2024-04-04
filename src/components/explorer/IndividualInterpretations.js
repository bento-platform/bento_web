import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Button, Descriptions, Empty, Modal, Typography } from "antd";
import { ExperimentOutlined, MedicineBoxOutlined } from "@ant-design/icons";

import { individualPropTypesShape } from "@/propTypes";

import "./explorer.css";
import { useIndividualInterpretations } from "./utils";
import OntologyTerm from "./OntologyTerm";
import { GeneDescriptor } from "./IndividualGenes";
import VariantDescriptor from "./IndividualVariants";
import BiosampleIDCell from "./searchResultsTables/BiosampleIDCell";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";


export const VariantInterpretation = ({ variationInterpretation }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const closeModal = () => setModalVisible(false);
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label="ACMG Pathogenicity classification">
                {variationInterpretation.acmg_pathogenicity_classification}
            </Descriptions.Item>
            <Descriptions.Item label="Therapeutic Actionability">
                {variationInterpretation.therapeutic_actionability}
            </Descriptions.Item>
            <Descriptions.Item label="Variant Descriptor">
                <Button onClick={() => setModalVisible(!modalVisible)}>
                    {variationInterpretation.variation_descriptor.id}
                </Button>
                <Modal
                    title="Variation Descriptor"
                    open={modalVisible}
                    onOk={closeModal}
                    onCancel={closeModal}
                    width="50%"
                    footer={null}
                >
                    <VariantDescriptor
                        variationDescriptor={variationInterpretation.variation_descriptor}
                    />
                </Modal>
            </Descriptions.Item>
        </Descriptions>
    );
};
VariantInterpretation.propTypes = {
    variationInterpretation: PropTypes.object,
};

export const GenomicInterpretationDetails = ({ genomicInterpretation }) => {
    const relatedType = genomicInterpretation?.extra_properties?.__related_type ?? "unknown";
    const relatedLabel = relatedType[0].toUpperCase() + relatedType.slice(1).toLowerCase();
    const isBiosampleRelated = relatedType === "biosample";

    const variantInterpretation = genomicInterpretation?.variant_interpretation;
    const geneDescriptor = genomicInterpretation?.gene_descriptor;

    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={`${relatedLabel} ID`}>
                { isBiosampleRelated
                    ? <BiosampleIDCell biosample={genomicInterpretation.subject_or_biosample_id}/>
                    : genomicInterpretation.subject_or_biosample_id
                }
            </Descriptions.Item>
            {variantInterpretation && <Descriptions.Item label="Variant Interpretation">
                <VariantInterpretation variationInterpretation={variantInterpretation} />
            </Descriptions.Item>}
            {geneDescriptor && <Descriptions.Item label="Gene Descriptor">
                <GeneDescriptor geneDescriptor={geneDescriptor}/>
            </Descriptions.Item>}
        </Descriptions>
    );
};
GenomicInterpretationDetails.propTypes = {
    genomicInterpretation: PropTypes.object,
};


const INTERPRETATIONS_COLUMNS = [
    {
        title: "ID",
        dataIndex: "id",
    },
    {
        title: "Created",
        dataIndex: "created",
    },
    {
        title: "Updated",
        dataIndex: "updated",
    },
    {
        title: "Progress Status",
        dataIndex: "progress_status",
    },
    {
        title: "Summary",
        dataIndex: "summary",
    },
];

const GENOMIC_INTERPRETATION_COLUMNS = [
    {
        title: "ID",
        dataIndex: "id",
    },
    {
        title: "Subject or Biosample ID",
        dataIndex: "subject_or_biosample_id",
    },
    {
        title: "Interpretation Status",
        dataIndex: "interpretation_status",
    },
];

const expandedGIRowRender = (gi) => (<GenomicInterpretationDetails genomicInterpretation={gi} />);

const GenomicInterpretations = ({ genomicInterpretations, onGenomicInterpretationClick }) => (
    <RoutedIndividualContentTable
        data={genomicInterpretations}
        urlParam="selectedGenomicInterpretation"
        columns={GENOMIC_INTERPRETATION_COLUMNS}
        handleRowSelect={onGenomicInterpretationClick}
        expandedRowRender={expandedGIRowRender}
        // GenomicInterpretation.id are PK integers, expandedRowKeys expects strings
        rowKey={(gi) => gi.id.toString()}
    />
);
GenomicInterpretations.propTypes = {
    genomicInterpretations: PropTypes.arrayOf(PropTypes.object),
    onGenomicInterpretationClick: PropTypes.func,
};


const IndividualGenomicInterpretations = ({ genomicInterpretations }) => {
    return (
        <RoutedIndividualContent
            urlParam="selectedGenomicInterpretation"
            renderContent={({ onContentSelect }) => (
                <GenomicInterpretations
                    genomicInterpretations={genomicInterpretations}
                    onGenomicInterpretationClick={onContentSelect}
                />
            )}
        />
    );
};
IndividualGenomicInterpretations.propTypes = {
    genomicInterpretations: PropTypes.arrayOf(PropTypes.object),
};

const InterpretationDetail = ({ interpretation }) => {
    const { diagnosis } = interpretation;

    const sortedGenomicInterpretations = useMemo(
        () => (diagnosis?.genomic_interpretations ?? [])
            .sort((g1, g2) => g1.id > g2.id ? 1 : -1),
        [diagnosis],
    );

    return (<div className="experiment_and_results">
        <Typography.Title level={4}>
            <MedicineBoxOutlined />{" "}Diagnosis
        </Typography.Title>
        {diagnosis ? <Descriptions layout="horizontal" bordered column={2} size="small">
            <Descriptions.Item label="Disease">
                <OntologyTerm term={diagnosis.disease}/>
            </Descriptions.Item>
        </Descriptions> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}

        <Typography.Title level={4}>
            <ExperimentOutlined />{" "}Genomic Interpretations
        </Typography.Title>
        {sortedGenomicInterpretations.length ? <IndividualGenomicInterpretations
            genomicInterpretations={sortedGenomicInterpretations}
        /> : null}
    </div>);
};
InterpretationDetail.propTypes = {
    interpretation: PropTypes.object,
};

const expandedInterpretationRowRender = (interpretation) => (
    <InterpretationDetail interpretation={interpretation} />
);

const Interpretations = ({ individual, handleInterpretationClick }) => {
    const interpretationsData = useIndividualInterpretations(individual);
    return (
        <RoutedIndividualContentTable
            columns={INTERPRETATIONS_COLUMNS}
            data={interpretationsData}
            expandedRowRender={expandedInterpretationRowRender}
            handleRowSelect={handleInterpretationClick}
            rowKey="id"
            urlParam="selectedInterpretation"
        />
    );
};
Interpretations.propTypes = {
    individual: individualPropTypesShape,
    handleInterpretationClick: PropTypes.func,
};

const IndividualInterpretations = ({ individual }) => (
    <RoutedIndividualContent
        data={individual}
        urlParam="selectedInterpretation"
        renderContent={({ onContentSelect }) => (
            <Interpretations individual={individual} handleInterpretationClick={onContentSelect} />
        )}
    />
);

IndividualInterpretations.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualInterpretations;
