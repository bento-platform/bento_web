import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import MonospaceText from "@/components/common/MonospaceText";

const ProjectTitleDisplay = ({ projectID, link }) => {
    const projectsByID = useSelector(state => state.projects.itemsByID);

    if (!projectID) return EM_DASH;

    const title = projectsByID[projectID]?.title;

    if (!title) return (
        <span>
            <MonospaceText>{projectID}</MonospaceText>{" "}
            <span style={{ color: "#f5222d" }}>(MISSING)</span>
        </span>
    );

    if (!link) return title;
    return <Link to={`/data/manager/projects/${projectID}`}>{title}</Link>;
};

ProjectTitleDisplay.propTypes = {
    projectID: PropTypes.string,
    link: PropTypes.bool,
};

ProjectTitleDisplay.defaultProps = {
    link: false,
};

export default ProjectTitleDisplay;
