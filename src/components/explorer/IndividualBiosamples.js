import React, {Fragment, useCallback, useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import { Route, Switch, useHistory, useRouteMatch, useParams } from "react-router-dom";

import { Button, Descriptions, Table } from "antd";

import { EM_DASH } from "../../constants";
import { useDeduplicatedIndividualBiosamples } from "./utils";
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

const BiosampleProcedure = ({ individual, procedure }) => (
    <div>
        <strong>Code:</strong>{" "}<OntologyTerm individual={individual} term={procedure.code} />
        {procedure.body_site ? (
            <div>
                <strong>Body Site:</strong>{" "}<OntologyTerm individual={individual} term={procedure.body_site} />
            </div>
        ) : null}
    </div>
);
BiosampleProcedure.propTypes = {
    individual: individualPropTypesShape.isRequired,
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
    return (
        <Descriptions bordered={true} column={1} size="small" style={{maxWidth: 800}}>
            <Descriptions.Item label="ID">
                {biosample.id}
            </Descriptions.Item>
            <Descriptions.Item label="Sampled Tissue">
                <OntologyTerm individual={individual} term={biosample.sampled_tissue} />
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
                <BiosampleProcedure individual={individual} procedure={biosample.procedure} />
            </Descriptions.Item>
            <Descriptions.Item label="Histological Diagnosis">
                <OntologyTerm individual={individual} term={biosample.histological_diagnosis} />
            </Descriptions.Item>
            <Descriptions.Item label="Ind. Age At Collection">
                {biosample.individual_age_at_collection
                    ? biosample.individual_age_at_collection.age ??
                    `Between ${biosample.individual_age_at_collection.start.age}` +
                    `and ${biosample.individual_age_at_collection.end.age}`
                    : EM_DASH}
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
                render: tissue => <OntologyTerm individual={individual} term={tissue} />,
            },
            {
                title: "Experiments",
                key: "experiments",
                render: (_, {experiments}) => (
                    <ExperimentsClickList experiments={experiments} handleExperimentClick={handleExperimentClick} />
                ),
            },
        ],
        [individual, handleExperimentClick],
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
        console.log(match);
        if (!bID) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${bID}`);
    }, [history, match]);

    const handleExperimentClick = useCallback((eid) => {
        const hashLink = experimentsUrl + "#" + eid;
        history.push(hashLink);
    }, [experimentsUrl, history]);

    return (
        <Switch>
            <Route path={`${match.path}/:selectedBiosample`}>
                <Biosamples
                    individual={individual}
                    handleBiosampleClick={handleBiosampleClick}
                    handleExperimentClick={handleExperimentClick}
                />
            </Route>
            <Route path={match.path} exact={true}>
                <Biosamples
                    individual={individual}
                    handleBiosampleClick={handleBiosampleClick}
                    handleExperimentClick={handleExperimentClick}
                />
            </Route>
        </Switch>
    );
};

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    experimentsUrl: PropTypes.string,
};

export default IndividualBiosamples;
