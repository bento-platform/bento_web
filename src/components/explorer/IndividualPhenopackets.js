import React from "react";

import { individualPropTypesShape } from "../../propTypes";
import ReactJson from "react-json-view";

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
