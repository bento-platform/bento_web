import { Link } from "react-router-dom";

import { EM_DASH } from "@/constants";
import ErrorText from "@/components/common/ErrorText";
import MonospaceText from "@/components/common/MonospaceText";
import { useProjects } from "@/modules/metadata/hooks";

export type ProjectTitleDisplayProps = {
  projectID: string;
  link?: boolean;
};

const ProjectTitleDisplay = ({ projectID, link }: ProjectTitleDisplayProps) => {
  const { itemsByID: projectsByID } = useProjects();

  if (!projectID) return EM_DASH;

  const title = projectsByID[projectID]?.title;

  if (!title)
    return (
      <span>
        <MonospaceText>{projectID}</MonospaceText> <ErrorText>(NOT AVAILABLE)</ErrorText>
      </span>
    );

  if (!link) return title;
  return <Link to={`/data/manager/projects/${projectID}`}>{title}</Link>;
};

export default ProjectTitleDisplay;
