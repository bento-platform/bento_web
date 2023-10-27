import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";
import { Button, Descriptions, Empty, Icon, Table, Typography } from "antd";

import { useIndividualResources, useIndividualInterpretations } from "./utils";
import "./explorer.css";
import { individualPropTypesShape } from "../../propTypes";
import OntologyTerm from "./OntologyTerm";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";

const createdAndUpdatedDescriptions = (data) => {
    const descriptions = [];
    if ("created" in data) {
        descriptions.push(<Descriptions.Item label="Created" key={"created"}>{data.created}</Descriptions.Item>);
    }

    if ("updated" in data) {
        descriptions.push(<Descriptions.Item label="Updated" key={"updated"}>{data.updated}</Descriptions.Item>);
    }
    return descriptions;
};

export const VariantInterpretation = ({ variationInterpretation, variantsUrl }) => {
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={"ACMG Pathogenicity classification"}>
                {variationInterpretation.acmg_pathogenicity_classification}
            </Descriptions.Item>
            <Descriptions.Item label={"Therapeutic Actionability"}>
                {variationInterpretation.therapeutic_actionability}
            </Descriptions.Item>
            <Descriptions.Item label={"Variant Descriptor"}>
                <Link to={{ pathname: variantsUrl }}>
                    <Button>{variationInterpretation.variation_descriptor.id}</Button>
                </Link>
            </Descriptions.Item>
        </Descriptions>
    );
};
VariantInterpretation.propTypes = {
    variationInterpretation: PropTypes.object,
    variantsUrl: PropTypes.string,
};

export const GenomicInterpretationDetails = ({ genomicInterpretation, variantsUrl, genesUrl }) => {
    const relatedType = genomicInterpretation?.extra_properties?.related_type ?? "unknown";
    const relatedLabel = relatedType[0].toUpperCase() + relatedType.slice(1).toLowerCase();

    const variantInterpretation = genomicInterpretation?.variant_interpretation;
    const geneDescriptor = genomicInterpretation?.gene_descriptor;

    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={`${relatedLabel} ID`}>
                {genomicInterpretation.subject_or_biosample_id}
            </Descriptions.Item>
            {createdAndUpdatedDescriptions(genomicInterpretation)}
            {variantInterpretation && <Descriptions.Item label={"Variant Interpretation"}>
                <VariantInterpretation variationInterpretation={variantInterpretation} variantsUrl={variantsUrl} />
            </Descriptions.Item>}
            {geneDescriptor && <Descriptions.Item label="Gene Descriptor">
                {/* TODO: GeneDescriptor component */}
                {genesUrl}
            </Descriptions.Item>}
        </Descriptions>
    );
};
GenomicInterpretationDetails.propTypes = {
    genomicInterpretation: PropTypes.object,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
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

const GenomicInterpretations = ({ genomicInterpretations, variantsUrl, genesUrl, onGenomicInterpretationClick }) => {
    const { selectedGenomicInterpretation } = useParams();
    // const selectedRowKeys = useMemo(
    //     () => selectedGenomicInterpretation ? [selectedGenomicInterpretation] : [],
    //     [selectedGenomicInterpretation],
    // );
    const selectedRowKeys = selectedGenomicInterpretation ? [selectedGenomicInterpretation] : [];

    console.log(selectedRowKeys);

    const onExpand = useCallback(
        (e, gi) => {
            onGenomicInterpretationClick(e ? gi.id : undefined);
        },
        [onGenomicInterpretationClick],
    );

    const giRowRender = useCallback(
        (gi) => (<GenomicInterpretationDetails
            genomicInterpretation={gi}
            variantsUrl={variantsUrl}
            genesUrl={genesUrl} />),
        [variantsUrl, genesUrl],
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
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
    onGenomicInterpretationClick: PropTypes.func,
};


const IndividualGenomicInterpretations = ({ genomicInterpretations, genesUrl, variantsUrl }) => {
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
            variantsUrl={variantsUrl}
            genesUrl={genesUrl}
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
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};

const InterpretationDetail = ({ interpretation, resourcesTuple, genesUrl, variantsUrl }) => {
    const { diagnosis } = interpretation;

    const sortedGenomicInterpretations = useMemo(
        () => (diagnosis?.genomic_interpretations ?? [])
            .sort((g1, g2) => g1.id > g2.id ? 1 : -1),
        [diagnosis],
    );

    return (<div className="experiment_and_results">
        <Typography.Title level={4}><Icon type="medicine-box" />Diagnosis</Typography.Title>
        {diagnosis ? <Descriptions layout="horizontal" bordered column={2} size="small">
            <Descriptions.Item label="Disease">
                <OntologyTerm
                    resourcesTuple={resourcesTuple}
                    term={diagnosis.disease_ontology}
                />
            </Descriptions.Item>
        </Descriptions> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}

        <Typography.Title level={4}><Icon type="experiment" />Genomic Interpretations</Typography.Title>
        {sortedGenomicInterpretations.length ? <IndividualGenomicInterpretations
            genomicInterpretations={sortedGenomicInterpretations}
            genesUrl={genesUrl}
            variantsUrl={variantsUrl}
        /> : null}
    </div>);
};
InterpretationDetail.propTypes = {
    interpretation: PropTypes.object,
    resourcesTuple: PropTypes.array,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};

const Interpretations = ({ individual, variantsUrl, genesUrl, handleInterpretationClick }) => {
    const { selectedInterpretation } = useParams();
    const selectedRowKeys = useMemo(
        () => selectedInterpretation ? [selectedInterpretation] : [],
        [selectedInterpretation],
    );

    const interpretationsData = useIndividualInterpretations(individual);
    const resourcesTuple = useIndividualResources(individual);

    const onExpand = useCallback(
        (e, interpretation) => {
            handleInterpretationClick(e ? interpretation.id : undefined);
        },
        [handleInterpretationClick],
    );

    const interpretationRowRender = useCallback(
        (interpretation) => (
            <InterpretationDetail interpretation={interpretation}
                                  resourcesTuple={resourcesTuple}
                                  genesUrl={genesUrl}
                                  variantsUrl={variantsUrl}

            />
        ),
        [resourcesTuple],
    );
    return (
        <Table
            bordered={true}
            pagination={false}
            size="middle"
            columns={INTERPRETATIONS_COLUMNS}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={interpretationRowRender}
            dataSource={interpretationsData}
            rowKey="id"
        />
    );
};
Interpretations.propTypes = {
    individual: individualPropTypesShape,
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
    handleInterpretationClick: PropTypes.func,
};

const IndividualInterpretations = ({ individual, variantsUrl, genesUrl }) => {
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
            variantsUrl={variantsUrl}
            genesUrl={genesUrl}
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
    variantsUrl: PropTypes.string,
    genesUrl: PropTypes.string,
};

export default IndividualInterpretations;
