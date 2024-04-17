import React, { memo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import MonospaceText from "@/components/common/MonospaceText";

const DatasetTitleDisplay = memo(({ datasetID, link }) => {
    const datasetsByID = useSelector(state => state.projects.datasetsByID);

    if (!datasetID) return EM_DASH;

    const dataset = datasetsByID[datasetID];

    if (!dataset) return (
        <span>
            <MonospaceText>{datasetID}</MonospaceText>{" "}
            <span style={{ color: "#f5222d" }}>(NOT AVAILABLE)</span>
        </span>
    );

    const { title } = dataset;

    if (!link) return title;
    return <Link to={`/data/manager/projects/${dataset.project}#dataset-${dataset.identifier}`}>{title}</Link>;
});
DatasetTitleDisplay.propTypes = {
    datasetID: PropTypes.string,
    link: PropTypes.bool,
};

export default DatasetTitleDisplay;
