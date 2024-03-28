import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useHistory, useParams } from "react-router-dom";

import { Button, Descriptions } from "antd";

import { EM_DASH } from "@/constants";
import {
    biosamplePropTypesShape,
    experimentPropTypesShape,
    individualPropTypesShape,
    ontologyShape,
} from "@/propTypes";
import { useDeduplicatedIndividualBiosamples } from "./utils";

import OntologyTerm from "./OntologyTerm";
import TimeElement from "./TimeElement";

import "./explorer.css";
import BiosampleIDCell from "./searchResultsTables/BiosampleIDCell";
import { MeasurementsTable } from "./IndividualMeasurements";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import ExtraProperties from "./ExtraProperties";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const BiosampleProcedure = ({ procedure }) => {
    if (!procedure) {
        return EM_DASH;
    }

    return (
        <div>
            <strong>Code:</strong>{" "}<OntologyTerm term={procedure.code} />
            {procedure.body_site ? (
                <div>
                    <strong>Body Site:</strong>{" "}
                    <OntologyTerm term={procedure.body_site} />
                </div>
            ) : null}
            {procedure.performed ? (
                <div>
                    <strong>Performed:</strong>{" "}
                    <TimeElement timeElement={procedure.performed} />
                </div>
            ) : null}
        </div>
    );
};
BiosampleProcedure.propTypes = {
    procedure: PropTypes.shape({
        code: ontologyShape.isRequired,
        body_site: ontologyShape,
        performed: PropTypes.object,
    }),
};

const ExperimentsClickList = ({ experiments, handleExperimentClick }) => {
    if (!experiments?.length) return EM_DASH;
    return experiments?.length ? (
        <>
            {(experiments ?? []).map((e, i) => (
                <Fragment key={i}>
                    <Button onClick={() => handleExperimentClick(e.id)}>
                        {e.experiment_type}
                    </Button>
                    {" "}
                </Fragment>
            ))}
        </>
    ) : EM_DASH;
};
ExperimentsClickList.propTypes = {
    experiments: PropTypes.arrayOf(experimentPropTypesShape),
    handleExperimentClick: PropTypes.func,
};

const BiosampleDetail = ({ biosample, handleExperimentClick }) => {
    return (
        <Descriptions bordered={true} column={1} size="small">
            <Descriptions.Item label="ID">
                {biosample.id}
            </Descriptions.Item>
            <Descriptions.Item label="Derived from ID">
                {biosample.derived_from_id ? <BiosampleIDCell biosample={biosample.derived_from_id} /> : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Sampled Tissue">
                <OntologyTerm term={biosample.sampled_tissue} />
            </Descriptions.Item>
            <Descriptions.Item label="Sample Type">
                <OntologyTerm term={biosample.sample_type} />
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
                <BiosampleProcedure procedure={biosample.procedure} />
            </Descriptions.Item>
            <Descriptions.Item label="Histological Diagnosis">
                <OntologyTerm term={biosample.histological_diagnosis} />
            </Descriptions.Item>
            <Descriptions.Item label="Pathological Stage">
                <OntologyTerm term={biosample.pathological_stage} />
            </Descriptions.Item>
            <Descriptions.Item label="Time of Collection">
                <TimeElement timeElement={biosample.time_of_collection} />
            </Descriptions.Item>
            <Descriptions.Item label="Measurements">
                {biosample.hasOwnProperty("measurements") &&
                    Object.keys(biosample.measurements).length ? (
                        <MeasurementsTable measurements={biosample.measurements} />
                    ) : (
                        EM_DASH
                    )}
            </Descriptions.Item>
            <Descriptions.Item label="Extra Properties">
                <ExtraProperties extraProperties={biosample?.extra_properties} />
            </Descriptions.Item>
            <Descriptions.Item label="Available Experiments">
                <ExperimentsClickList
                    experiments={biosample.experiments}
                    handleExperimentClick={handleExperimentClick}
                />
            </Descriptions.Item>
        </Descriptions>
    );
};
BiosampleDetail.propTypes = {
    biosample: biosamplePropTypesShape,
    handleExperimentClick: PropTypes.func,
};

const Biosamples = ({ individual, handleBiosampleClick, handleExperimentClick }) => {
    const { selectedBiosample } = useParams();

    useEffect(() => {
        // If, on first load, there's a selected biosample:
        //  - find the biosample-${id} element (a span in the table row)
        //  - scroll it into view
        setTimeout(() => {
            if (selectedBiosample) {
                const el = document.getElementById(`biosample-${selectedBiosample}`);
                if (!el) return;
                el.scrollIntoView();
            }
        }, 100);
    }, []);

    const biosamples = useDeduplicatedIndividualBiosamples(individual);

    const columns = useMemo(
        () => [
            {
                title: "Biosample",
                dataIndex: "id",
                render: id => <span id={`biosample-${id}`}>{id}</span>,  // scroll anchor wrapper
            },
            {
                title: "Sampled Tissue",
                dataIndex: "sampled_tissue",
                render: tissue => <OntologyTerm term={tissue} />,
            },
            {
                title: "Experiments",
                key: "experiments",
                render: (_, {experiments}) => (
                    <ExperimentsClickList experiments={experiments} handleExperimentClick={handleExperimentClick} />
                ),
            },
        ],
        [handleExperimentClick],
    );

    const expandedRowRender = useCallback(
        (biosample) => (
            <BiosampleDetail biosample={biosample} handleExperimentClick={handleExperimentClick} />
        ),
        [handleExperimentClick],
    );

    return (
        <RoutedIndividualContentTable
            data={biosamples}
            urlParam="selectedBiosample"
            columns={columns}
            rowKey="id"
            handleRowSelect={handleBiosampleClick}
            expandedRowRender={expandedRowRender}
        />
    );
};
Biosamples.propTypes = {
    individual: individualPropTypesShape,
    handleBiosampleClick: PropTypes.func,
    handleExperimentClick: PropTypes.func,
};

const IndividualBiosamples = ({ individual, experimentsUrl }) => {
    const history = useHistory();

    const handleExperimentClick = useCallback((eid) => {
        history.push(`${experimentsUrl}/${eid}`);
    }, [experimentsUrl, history]);

    return (
        <RoutedIndividualContent
            urlParam="selectedBiosample"
            renderContent={({ onContentSelect }) => (
                <Biosamples
                    individual={individual}
                    handleBiosampleClick={onContentSelect}
                    handleExperimentClick={handleExperimentClick}
                />
            )}
        />
    );
};

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    experimentsUrl: PropTypes.string,
};

export default IndividualBiosamples;
