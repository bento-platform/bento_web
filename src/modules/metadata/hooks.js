import { useSelector } from "react-redux";
import { makeProjectDatasetResource, makeProjectResource } from "bento-auth-js";

export const useProjects = () => useSelector((state) => state.projects);

export const useProjectsAndDatasetsAsAuthzResources = () => {
    const { items: projects } = useProjects();
    return projects.flatMap(({ identifier: projectID, datasets }) => [
        makeProjectResource(projectID),
        ...(datasets.map((dataset) => makeProjectDatasetResource(projectID, dataset.identifier))),
    ]);
};
