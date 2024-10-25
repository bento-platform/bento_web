import { useEffect, useMemo } from "react";
import { useProjects } from "@/modules/metadata/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchDatasetDataTypesIfPossible,
  fetchDatasetsDataTypes,
  fetchDatasetSummariesIfPossible,
} from "@/modules/datasets/actions";

export const useDatasetDataTypes = () => {
  /**
   * Fetches the data type summaries for ALL datasets.
   * returns the store's values.
   */
  const dispatch = useAppDispatch();
  const { datasetsByID } = useProjects();
  useEffect(() => {
    if (Object.keys(datasetsByID).length) {
      dispatch(fetchDatasetsDataTypes()).catch(console.error);
    }
  }, [dispatch, datasetsByID]);
  return useAppSelector((state) => state.datasetDataTypes);
};

export const useDatasetDataTypesByID = (datasetID) => {
  /**
   * Fetches the data types ONLY for the given dataset.
   * Returns the store's value for the given dataset ID.
   */

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDatasetDataTypesIfPossible(datasetID)).catch(console.error);
  }, [dispatch, datasetID]);

  const dataTypes = useAppSelector((state) => state.datasetDataTypes.itemsByID[datasetID]);
  return useMemo(() => {
    return {
      dataTypesByID: dataTypes?.itemsByID ?? {},
      isFetchingDataTypes: dataTypes?.isFetching ?? true,
      hasAttemptedDataTypes: dataTypes?.hasAttempted ?? false,
    };
  }, [dataTypes]);
};

export const useDatasetSummariesByID = (datasetID) => {
  /**
   * Fetches the data type summaries ONLY for the given dataset.
   * Returns the store's value for the given dataset ID.
   */
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDatasetSummariesIfPossible(datasetID)).catch(console.error);
  }, [dispatch, datasetID]);
  return useAppSelector((state) => state.datasetSummaries.itemsByID[datasetID]);
};
