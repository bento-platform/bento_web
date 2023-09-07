import React, {useCallback, useMemo} from "react";
import PropTypes from "prop-types";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";

import {Button, Descriptions, Tabs} from "antd";

import { EM_DASH } from "../../constants";
import { renderOntologyTerm } from "./ontologies";
import { individualPropTypesShape } from "../../propTypes";
import JsonView from "./JsonView";
import { useRouteMatch, useParams } from "react-router-dom/cjs/react-router-dom";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const BiosampleTabs = ({ individual, handleBiosampleClick, handleExperimentClick }) => {
    const { selectedBiosample } = useParams();

    const biosamples = useMemo(
        () => Object.values(
            Object.fromEntries(
                (individual?.phenopackets ?? [])
                    .flatMap((p) => p.biosamples)
                    .map(b => [b.id, b]),
            ),
        ),
        [individual]);

    return <Tabs type="card" activeKey={selectedBiosample} onChange={handleBiosampleClick}>
        {biosamples.map(biosample => (
            <Tabs.TabPane key={biosample.id} tab={`Biosample ${biosample.id}`}>
                <Descriptions bordered={true} column={1} size="small" style={{maxWidth: 800}}>
                    <Descriptions.Item label="ID">
                        {biosample.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sampled Tissue">
                        {renderOntologyTerm(biosample.sampled_tissue)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Procedure">
                        <div>
                            <strong>Code:</strong>{" "}
                            {renderOntologyTerm(biosample.procedure.code)}
                            {biosample.procedure.body_site ? (
                                <div>
                                    <strong>Body Site:</strong>{" "}
                                    {renderOntologyTerm(
                                        biosample.procedure.body_site,
                                    )}
                                </div>
                            ) : null}
                        </div>
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
                        {(biosample.experiments ?? [])
                            .map((e, i) => (
                                <Button
                                    key={i}
                                    onClick={() => handleExperimentClick(e.id)}
                                >
                                    {e.experiment_type}
                                </Button>
                            ))}
                    </Descriptions.Item>
                </Descriptions>
            </Tabs.TabPane>
        ))}
    </Tabs>;
};
BiosampleTabs.propTypes = {
    individual: individualPropTypesShape,
    handleBiosampleClick: PropTypes.func,
    handleExperimentClick: PropTypes.func,
};

const IndividualBiosamples = ({individual, experimentsUrl}) => {
    const history = useHistory();
    const match = useRouteMatch();

    const biosampleIDs = useMemo(
        () => Array.from(new Set(
            (individual?.phenopackets ?? [])
                .flatMap((p) => p.biosamples)
                .map(b => b.id),
        )),
        [individual]);

    const handleBiosampleClick = useCallback((bID) => {
        history.push(`${match.path}/${bID}`);
    }, [history, match]);

    const handleExperimentClick = useCallback((eid) => {
        const hashLink = experimentsUrl + "#" + eid;
        history.push(hashLink);
    }, [experimentsUrl, history]);

    return (
        <Switch>
            <Route path={`${match.path}/:selectedBiosample`}>
                <BiosampleTabs
                    individual={individual}
                    handleBiosampleClick={handleBiosampleClick}
                    handleExperimentClick={handleExperimentClick}
                />
            </Route>
            <Redirect from={match.path} to={`${match.path}/${biosampleIDs[0]}`} />
        </Switch>
    );
};

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    experimentsUrl: PropTypes.string,
};

export default IndividualBiosamples;
