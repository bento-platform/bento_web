import React from "react";
import { Link } from "react-router-dom";

import { EM_DASH } from "@/constants";
import MonospaceText from "@/components/common/MonospaceText";
import { useProjects } from "@/modules/metadata/hooks";

export type ProjectTitleDisplayProps = {
    projectID: string;
    link: boolean;
};

const ProjectTitleDisplay = ({ projectID, link }: ProjectTitleDisplayProps) => {
    const { itemsByID: projectsByID } = useProjects();

    if (!projectID) return EM_DASH;

    const title = projectsByID[projectID]?.title;

    if (!title) return (
        <span>
            <MonospaceText>{projectID}</MonospaceText>{" "}
            <span style={{ color: "#f5222d" }}>(NOT AVAILABLE)</span>
        </span>
    );

    if (!link) return title;
    return <Link to={`/data/manager/projects/${projectID}`}>{title}</Link>;
};

ProjectTitleDisplay.defaultProps = {
    link: false,
};

export default ProjectTitleDisplay;
