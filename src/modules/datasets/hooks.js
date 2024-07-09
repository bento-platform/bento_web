import { useEffect } from "react";
import { useProjects } from "@/modules/metadata/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchDatasetDataTypesSummariesIfPossible, fetchDatasetsDataTypes } from "@/modules/datasets/actions";

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

export const useDatasetDataTypeByID = (datasetId) => {
  /**
   * Fetches the data types ONLY for the given dataset.
   * Returns the store's value for the given dataset ID.
   */
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDatasetDataTypesSummariesIfPossible(datasetId));
  }, [datasetId]);
  return useAppSelector((state) => state.datasetDataTypes.itemsByID[datasetId]);
};
