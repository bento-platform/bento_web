import React, {useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";

import PropTypes from "prop-types";
import { datasetPropTypesShape, projectPropTypesShape } from "../../propTypes";

const DatasetDataTypes = ({isPrivate, project, dataset, onIngest, isFetchingDatasets}) => {
    
    return (
        <>
            Under construction.
        </>
    );
};

DatasetDataTypes.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    onIngest: PropTypes.func,
    isFetchingDatasets: PropTypes.bool,
};

export default DatasetDataTypes;
