import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeProjectDatasetResource, makeProjectResource } from "bento-auth-js";
import { useService } from "@/modules/services/hooks";
import { fetchExtraPropertiesSchemaTypes, fetchOverviewSummaryIfNeeded, fetchProjectsWithDatasets } from "./actions";

export const useProjects = () => {
  const dispatch = useDispatch();
  const metadataService = useService("metadata");
  useEffect(() => {
    dispatch(fetchProjectsWithDatasets()).catch((err) => console.error(err));
  }, [dispatch, metadataService]);
  return useSelector((state) => state.projects);
};

export const useProjectsAndDatasetsAsAuthzResources = () => {
  const { items: projects } = useProjects();
  return useMemo(
    () =>
      projects.flatMap(({ identifier: projectID, datasets }) => [
        makeProjectResource(projectID),
        ...datasets.map((dataset) => makeProjectDatasetResource(projectID, dataset.identifier)),
      ]),
    [projects],
  );
};

export const useOverviewSummary = () => {
  const dispatch = useDispatch();
  const metadataService = useService("metadata");
  useEffect(() => {
    dispatch(fetchOverviewSummaryIfNeeded()).catch((err) => console.error(err));
  }, [dispatch, metadataService]);
  return useSelector((state) => state.overviewSummary);
};

export const useProjectJsonSchemaTypes = () => {
  const dispatch = useDispatch();
  const metadataService = useService("metadata");
  useEffect(() => {
    dispatch(fetchExtraPropertiesSchemaTypes());
  }, [dispatch, metadataService]);
  const { isFetchingExtraPropertiesSchemaTypes, isCreatingJsonSchema, extraPropertiesSchemaTypes } = useProjects();
  return useMemo(
    () => ({
      isFetchingExtraPropertiesSchemaTypes,
      isCreatingJsonSchema,
      extraPropertiesSchemaTypes,
    }),
    [isFetchingExtraPropertiesSchemaTypes, isCreatingJsonSchema, extraPropertiesSchemaTypes],
  );
};
