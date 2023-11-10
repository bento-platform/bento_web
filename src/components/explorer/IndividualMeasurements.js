import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { individualPropTypesShape, measurementPropTypesShape } from "../../propTypes";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";
import { useIndividualPhenopacketDataIndex, useIndividualResources } from "./utils";
import ReactJson from "react-json-view";
import { RoutedIndividualContent } from "./IndividualMedicalActions";


const Measurements = ({measurements, resourcesTuple, handleMeasurementClick}) => {
    const { selectedMeasurement } = useParams();
    console.log(measurements);
    return (
        <ReactJson src={measurements}/>
    );
};
Measurements.propTypes = {
    measurements: PropTypes.arrayOf(measurementPropTypesShape),
    resourcesTuple: PropTypes.array,
    handleMeasurementClick: PropTypes.func,
};

const IndividualMeasurements = ({individual}) => {
    return (
        <RoutedIndividualContent
            individual={individual}
            individualDataHook={useIndividualPhenopacketDataIndex}
            dataField="measurements"
            urlParam="selectedMeasurement"
            renderContent={({data, onContentSelect, resourcesTuple}) => (
                <Measurements
                    measurements={data}
                    resourcesTuple={resourcesTuple}
                    handleMeasurementClick={onContentSelect}
                />
            )}
        />
    );
}
IndividualMeasurements.propTypes = {
    individual: individualPropTypesShape
};

export default IndividualMeasurements;
