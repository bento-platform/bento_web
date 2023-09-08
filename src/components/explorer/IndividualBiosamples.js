import React, {Fragment, useCallback, useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import { Route, Switch, useHistory } from "react-router-dom";

import { Button, Descriptions, Table } from "antd";

import { EM_DASH } from "../../constants";
import { renderOntologyTerm } from "./ontologies";
import {
    biosamplePropTypesShape,
    experimentPropTypesShape,
    individualPropTypesShape,
    ontologyShape,
} from "../../propTypes";
import JsonView from "./JsonView";
import { useRouteMatch, useParams } from "react-router-dom/cjs/react-router-dom";

import "./explorer.css";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const BiosampleProcedure = ({procedure}) => (
    <div>
        <strong>Code:</strong>{" "}
        {renderOntologyTerm(procedure.code)}
        {procedure.body_site ? (
            <div>
                <strong>Body Site:</strong>{" "}
                {renderOntologyTerm(procedure.body_site)}
            </div>
        ) : null}
    </div>
);
BiosampleProcedure.propTypes = {
    procedure: PropTypes.shape({
        code: ontologyShape.isRequired,
        body_site: ontologyShape,
    }),
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

const BiosampleDetail = ({ biosample, handleExperimentClick }) => {
    return (
        <Descriptions bordered={true} column={1} size="small" style={{maxWidth: 800}}>
            <Descriptions.Item label="ID">
                {biosample.id}
            </Descriptions.Item>
            <Descriptions.Item label="Sampled Tissue">
                {renderOntologyTerm(biosample.sampled_tissue)}
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
                <BiosampleProcedure procedure={biosample.procedure} />
            </Descriptions.Item>
            <Descriptions.Item label="Histological Diagnosis">
                {renderOntologyTerm(biosample.histological_diagnosis)}
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

    const biosamples = useMemo(
        () => Object.values(
            Object.fromEntries(
                (individual?.phenopackets ?? [])
                    .flatMap((p) => p.biosamples)
                    .map(b => [b.id, b]),
            ),
        ),
        [individual]);

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
                render: tissue => renderOntologyTerm(tissue),
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

    const onExpand = useCallback(
        (e, biosample) => {
            handleBiosampleClick(e ? biosample.id : undefined);
        },
        [handleBiosampleClick],
    );

    const expandedRowRender = useCallback(
        (biosample) => (
            <BiosampleDetail biosample={biosample} handleExperimentClick={handleExperimentClick} />
        ),
        [handleExperimentClick],
    );

    return (
        <Table
            bordered={true}
            pagination={false}
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
