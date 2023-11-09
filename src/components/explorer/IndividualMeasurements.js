import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { individualPropTypesShape, measurementPropTypesShape } from "../../propTypes";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";
import { useIndividualPhenopacketDataIndex, useIndividualResources } from "./utils";


const Measurements = ({measurements, resourcesTuple, handleMeasurementClick}) => {
    return (
        <></>
    );
};
Measurements.propTypes = {
    measurements: PropTypes.arrayOf(measurementPropTypesShape),
    resourcesTuple: PropTypes.array,
    handleMeasurementClick: PropTypes.func,
};

const IndividualMeasurements = ({individual}) => {
    const history = useHistory();
    const match = useRouteMatch();

    const resourcesTuple = useIndividualResources(individual);
    const indexedMeasurements = useIndividualPhenopacketDataIndex(individual, "measurements");

    const handleMeasurementClick = useCallback((idx) => {
        if (!idx) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${idx}`);
    }, [history, match]);

    const measurementsNode = (
        <Measurements
            measurements={indexedMeasurements}
            resourcesTuple={resourcesTuple}
            handleMeasurementClick={handleMeasurementClick}
        />
    );

    return (
        <Switch>
            <Route path={`${match.path}/selectedMeasurement`}>{measurementsNode}</Route>
            <Route path={match.path}>{measurementsNode}</Route>
        </Switch>
    );


};
IndividualMeasurements.propTypes = {
    individual: individualPropTypesShape
};

export default IndividualMeasurements;
