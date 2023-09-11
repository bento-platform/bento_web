import React from "react";
import ReactJson from "react-json-view";
import { individualPropTypesShape } from "../../propTypes";

const IndividualPhenopackets = ({ individual }) => {
    return (
        <ReactJson
            src={individual.phenopackets}
            collapsed={false}
            displayDataTypes={false}
            name={false}
        />
    );
};

IndividualPhenopackets.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualPhenopackets;
