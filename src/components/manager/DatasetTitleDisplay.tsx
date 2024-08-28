import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { EM_DASH } from "@/constants";
import ErrorText from "@/components/common/ErrorText";
import MonospaceText from "@/components/common/MonospaceText";

export type DatasetTitleDisplayProps = {
  datasetID: string;
  link: boolean;
};

const DatasetTitleDisplay = ({ datasetID, link }: DatasetTitleDisplayProps) => {
  // @ts-expect-error We have not typed the state yet
  const datasetsByID = useSelector((state) => state.projects.datasetsByID);

  if (!datasetID) return EM_DASH;

  const dataset = datasetsByID[datasetID];

  if (!dataset)
    return (
      <span>
        <MonospaceText>{datasetID}</MonospaceText> <ErrorText>(NOT AVAILABLE)</ErrorText>
      </span>
    );

  const { title, project } = dataset;

  if (!link) return title;
  return <Link to={`/data/manager/projects/${project}#dataset-${datasetID}`}>{title}</Link>;
};
DatasetTitleDisplay.defaultProps = {
  link: false,
};

export default DatasetTitleDisplay;
