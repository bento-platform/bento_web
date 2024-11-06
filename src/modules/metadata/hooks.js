import { useEffect, useMemo } from "react";
import { makeProjectDatasetResource, makeProjectResource } from "bento-auth-js";
import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchDiscoverySchema, fetchExtraPropertiesSchemaTypes, fetchProjectsWithDatasets } from "./actions";
import { useJsonSchemaValidator } from "@/hooks";

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const metadataService = useService("metadata");
  useEffect(() => {
    dispatch(fetchProjectsWithDatasets()).catch((err) => console.error(err));
  }, [dispatch, metadataService]);
  return useAppSelector((state) => state.projects);
};

export const useProjectsArray = () => useProjects().items;
export const useDatasetsArray = () => useProjects().datasets;

export const useProjectsAndDatasetsAsAuthzResources = () => {
  const projects = useProjectsArray();
  return useMemo(
    () =>
      projects.flatMap(({ identifier: projectID, datasets }) => [
        makeProjectResource(projectID),
        ...datasets.map((dataset) => makeProjectDatasetResource(projectID, dataset.identifier)),
      ]),
    [projects],
  );
};

export const useProjectJsonSchemaTypes = () => {
  const dispatch = useAppDispatch();
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

export const useDiscoverySchema = () => {
  const dispatch = useAppDispatch();
  const metadataService = useService("metadata");
  useEffect(() => {
    dispatch(fetchDiscoverySchema()).catch((err) => console.error(err));
  }, [dispatch, metadataService]);
  return useAppSelector((state) => state.discovery.discoverySchema);
};

export const useDiscoveryValidator = () => {
  const discoverySchema = useDiscoverySchema();
  return useJsonSchemaValidator(discoverySchema, "discovery", true);
};
