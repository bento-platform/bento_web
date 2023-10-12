import React, {Fragment, useCallback, useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import { Route, Switch, useHistory, useRouteMatch, useParams } from "react-router-dom";

import { Button, Descriptions, Table } from "antd";

import { EM_DASH } from "../../constants";
import { useDeduplicatedIndividualBiosamples, useIndividualResources } from "./utils";
import {
    biosamplePropTypesShape,
    experimentPropTypesShape,
    individualPropTypesShape,
    ontologyShape,
} from "../../propTypes";

import JsonView from "./JsonView";
import OntologyTerm from "./OntologyTerm";

import "./explorer.css";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const BiosampleProcedure = ({ resourcesTuple, procedure }) => (
    <div>
        <strong>Code:</strong>{" "}<OntologyTerm resourcesTuple={resourcesTuple} term={procedure.code} />
        {procedure.body_site ? (
            <div>
                <strong>Body Site:</strong>{" "}
                <OntologyTerm resourcesTuple={resourcesTuple} term={procedure.body_site} />
            </div>
        ) : null}
    </div>
);
BiosampleProcedure.propTypes = {
    resourcesTuple: PropTypes.array,
    procedure: PropTypes.shape({
        code: ontologyShape.isRequired,
        body_site: ontologyShape,
    }).isRequired,
};

const ExperimentsClickList = ({ experiments, handleExperimentClick }) => {
    if (!experiments?.length) return EM_DASH;
    return (
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
    );
};
ExperimentsClickList.propTypes = {
    experiments: PropTypes.arrayOf(experimentPropTypesShape),
    handleExperimentClick: PropTypes.func,
};

const BiosampleDetail = ({ individual, biosample, handleExperimentClick }) => {
    const resourcesTuple = useIndividualResources(individual);
    return (
        <Descriptions bordered={true} column={1} size="small" style={{maxWidth: 800}}>
            <Descriptions.Item label="ID">
                {biosample.id}
            </Descriptions.Item>
            <Descriptions.Item label="Derived from ID">
                {biosample.derived_from_id ? biosample.derived_from_id : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Sampled Tissue">
                <OntologyTerm resourcesTuple={resourcesTuple} term={biosample.sampled_tissue} />
            </Descriptions.Item>
            <Descriptions.Item label="Sample Type">
                <OntologyTerm resourcesTuple={resourcesTuple} term={biosample.sample_type} />
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
                <BiosampleProcedure resourcesTuple={resourcesTuple} procedure={biosample.procedure} />
            </Descriptions.Item>
            <Descriptions.Item label="Histological Diagnosis">
                <OntologyTerm resourcesTuple={resourcesTuple} term={biosample.histological_diagnosis} />
            </Descriptions.Item>
            <Descriptions.Item label="Pathological Stage">
                <OntologyTerm resourcesTuple={resourcesTuple} term={biosample.pathological_stage} />
            </Descriptions.Item>
            <Descriptions.Item label="Ind. Age At Collection">
                {biosample.individual_age_at_collection
                    ? biosample.individual_age_at_collection.age ??
                    `Between ${biosample.individual_age_at_collection.start.age}` +
                    `and ${biosample.individual_age_at_collection.end.age}`
                    : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Measurements">
                {biosample.hasOwnProperty("measurements") &&
                    Object.keys(biosample.measurements).length ? (
                        <JsonView inputJson={biosample.measurements}/>
                    ) : (
                        EM_DASH
                    )}
            </Descriptions.Item>
            <Descriptions.Item label="Extra Properties">
                {biosample.hasOwnProperty("extra_properties") &&
                    Object.keys(biosample.extra_properties).length ? (
                        <JsonView inputJson={biosample.extra_properties} />
                    ) : (
                        EM_DASH
                    )}
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
    individual: individualPropTypesShape,
    biosample: biosamplePropTypesShape,
    handleExperimentClick: PropTypes.func,
};

const Biosamples = ({ individual, handleBiosampleClick, handleExperimentClick }) => {
    const { selectedBiosample } = useParams();
    const selectedRowKeys = useMemo(
        () => selectedBiosample ? [selectedBiosample] : [],
        [selectedBiosample],
    );

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
    const resourcesTuple = useIndividualResources(individual);

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
                render: tissue => <OntologyTerm resourcesTuple={resourcesTuple} term={tissue} />,
            },
            {
                title: "Experiments",
                key: "experiments",
                render: (_, {experiments}) => (
                    <ExperimentsClickList experiments={experiments} handleExperimentClick={handleExperimentClick} />
                ),
            },
        ],
        [resourcesTuple, handleExperimentClick],
    );

    const onExpand = useCallback(
        (e, biosample) => {
            handleBiosampleClick(e ? biosample.id : undefined);
        },
        [handleBiosampleClick],
    );

    const expandedRowRender = useCallback(
        (biosample) => (
            <BiosampleDetail
                individual={individual}
                biosample={biosample}
                handleExperimentClick={handleExperimentClick}
            />
        ),
        [handleExperimentClick],
    );

    return (
        <Table
            bordered={true}
            pagination={false}
            size="middle"
            columns={columns}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={expandedRowRender}
            dataSource={biosamples}
            rowKey="id"
        />
    );
};
Biosamples.propTypes = {
    individual: individualPropTypesShape,
    handleBiosampleClick: PropTypes.func,
    handleExperimentClick: PropTypes.func,
};

const IndividualBiosamples = ({individual, experimentsUrl}) => {
    const history = useHistory();
    const match = useRouteMatch();

    const handleBiosampleClick = useCallback((bID) => {
        if (!bID) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${bID}`);
    }, [history, match]);

    const handleExperimentClick = useCallback((eid) => {
        history.push(`${experimentsUrl}/${eid}`);
    }, [experimentsUrl, history]);

    const biosamplesNode = (
        <Biosamples
            individual={individual}
            handleBiosampleClick={handleBiosampleClick}
            handleExperimentClick={handleExperimentClick}
        />
    );

    return (
        <Switch>
            <Route path={`${match.path}/:selectedBiosample`}>{biosamplesNode}</Route>
            <Route path={match.path} exact={true}>{biosamplesNode}</Route>
        </Switch>
    );
};

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    experimentsUrl: PropTypes.string,
};

export default IndividualBiosamples;
