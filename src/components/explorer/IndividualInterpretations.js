import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Button, Descriptions, Empty, Icon, Modal, Table, Typography } from "antd";

import { useIndividualInterpretations } from "./utils";
import "./explorer.css";
import { individualPropTypesShape } from "../../propTypes";
import OntologyTerm from "./OntologyTerm";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";
import { GeneDescriptor } from "./IndividualGenes";
import VariantDescriptor from "./IndividualVariants";
import BiosampleIDCell from "./searchResultsTables/BiosampleIDCell";


export const VariantInterpretation = ({ variationInterpretation }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const closeModal = () => setModalVisible(false);
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={"ACMG Pathogenicity classification"}>
                {variationInterpretation.acmg_pathogenicity_classification}
            </Descriptions.Item>
            <Descriptions.Item label={"Therapeutic Actionability"}>
                {variationInterpretation.therapeutic_actionability}
            </Descriptions.Item>
            <Descriptions.Item label={"Variant Descriptor"}>
                <Button onClick={() => setModalVisible(!modalVisible)}>
                    {variationInterpretation.variation_descriptor.id}
                </Button>
                <Modal
                    title={"Variation Descriptor"}
                    visible={modalVisible}
                    onOk={closeModal}
                    onCancel={closeModal}
                    width={"50%"}
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
            {variantInterpretation && <Descriptions.Item label={"Variant Interpretation"}>
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

const GenomicInterpretations = ({ genomicInterpretations, onGenomicInterpretationClick }) => {
    const { selectedGenomicInterpretation } = useParams();
    const selectedRowKeys = useMemo(
        () => selectedGenomicInterpretation ? [selectedGenomicInterpretation] : [],
        [selectedGenomicInterpretation],
    );


    const onExpand = useCallback(
        (e, gi) => {
            onGenomicInterpretationClick(e ? gi.id : undefined);
        },
        [onGenomicInterpretationClick],
    );

    const giRowRender = useCallback(
        (gi) => (<GenomicInterpretationDetails
            genomicInterpretation={gi}
        />),
        [],
    );

    return (
        <Table
            bordered={true}
            pagination={false}
            size="middle"
            columns={GENOMIC_INTERPRETATION_COLUMNS}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={giRowRender}
            dataSource={genomicInterpretations}
            // GenomicInterpretation.id are PK integers, expandedRowKeys expects strings
            rowKey={(gi) => gi.id.toString()}
        />
    );
};
GenomicInterpretations.propTypes = {
    genomicInterpretations: PropTypes.arrayOf(PropTypes.object),
    onGenomicInterpretationClick: PropTypes.func,
};


const IndividualGenomicInterpretations = ({ genomicInterpretations }) => {
    const history = useHistory();
    const match = useRouteMatch();

    const handleGenomicInterpClick = useCallback((giID) => {
        if (!giID) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${giID}`);
    }, [history, match]);

    const genomicInterpretationsNode = (
        <GenomicInterpretations
            genomicInterpretations={genomicInterpretations}
            onGenomicInterpretationClick={handleGenomicInterpClick}
        />
    );

    return (
        <Switch>
            <Route path={`${match.path}/:selectedGenomicInterpretation`}>{genomicInterpretationsNode}</Route>
            <Route path={match.path} exact={true}>{genomicInterpretationsNode}</Route>
        </Switch>
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
            <Icon type="medicine-box" />{" "}Diagnosis
        </Typography.Title>
        {diagnosis ? <Descriptions layout="horizontal" bordered column={2} size="small">
            <Descriptions.Item label="Disease">
                <OntologyTerm term={diagnosis.disease}/>
            </Descriptions.Item>
        </Descriptions> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}

        <Typography.Title level={4}>
            <Icon type="experiment" />{" "}Genomic Interpretations
        </Typography.Title>
        {sortedGenomicInterpretations.length ? <IndividualGenomicInterpretations
            genomicInterpretations={sortedGenomicInterpretations}
        /> : null}
    </div>);
};
InterpretationDetail.propTypes = {
    interpretation: PropTypes.object,
};

const Interpretations = ({ individual, handleInterpretationClick }) => {
    const { selectedInterpretation } = useParams();
    const selectedRowKeys = useMemo(
        () => selectedInterpretation ? [selectedInterpretation] : [],
        [selectedInterpretation],
    );

    const interpretationsData = useIndividualInterpretations(individual);

    const onExpand = useCallback(
        (e, interpretation) => {
            handleInterpretationClick(e ? interpretation.id : undefined);
        },
        [handleInterpretationClick],
    );


    return (
        <Table
            bordered={true}
            pagination={false}
            size="middle"
            columns={INTERPRETATIONS_COLUMNS}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={(interpretation) => (
                <InterpretationDetail
                    interpretation={interpretation}
                />
            )}
            dataSource={interpretationsData}
            rowKey="id"
        />
    );
};
Interpretations.propTypes = {
    individual: individualPropTypesShape,
    handleInterpretationClick: PropTypes.func,
};

const IndividualInterpretations = ({ individual }) => {
    const history = useHistory();
    const match = useRouteMatch();

    const handleInterpretationClick = useCallback((interpID) => {
        if (!interpID) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${interpID}`);
    }, [history, match]);

    const interpretationsNode = (
        <Interpretations
            individual={individual}
            handleInterpretationClick={handleInterpretationClick}
        />
    );

    return (
        <Switch>
            <Route path={`${match.path}/:selectedInterpretation`}>{interpretationsNode}</Route>
            <Route path={match.path} exact={true}>{interpretationsNode}</Route>
        </Switch>
    );
};

IndividualInterpretations.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualInterpretations;
