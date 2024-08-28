import { Popover } from "antd";
import type { Resource } from "@/modules/authz/types";
import MonospaceText from "@/components/common/MonospaceText";
import ProjectTitleDisplay from "@/components/manager/ProjectTitleDisplay";
import DatasetTitleDisplay from "@/components/manager/DatasetTitleDisplay";

export type ResourceProps = {
  resource: Resource;
};

const Resource = ({ resource }: ResourceProps) => {
  if ("everything" in resource) {
    return <Popover content="Everything in this Bento instance.">Everything</Popover>;
  }

  return (
    <p style={{ margin: 0, lineHeight: "1.6em" }}>
      <strong>Project:</strong> <ProjectTitleDisplay projectID={resource.project} />
      {resource.dataset && (
        <>
          <br />
          <strong>Dataset:</strong> <DatasetTitleDisplay datasetID={resource.dataset} />
        </>
      )}
      {resource.data_type && (
        <>
          <br />
          <strong>Data Type:</strong> <MonospaceText>{resource.data_type}</MonospaceText>
        </>
      )}
    </p>
  );
};

export default Resource;
