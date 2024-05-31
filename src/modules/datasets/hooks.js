import { useEffect } from "react";
import { useProjects } from "@/modules/metadata/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchDatasetsDataTypes } from "@/modules/datasets/actions";

export const useDatasetDataTypes = () => {
    const dispatch = useAppDispatch();
    const { datasetsByID } = useProjects();
    useEffect(() => {
        if (Object.keys(datasetsByID).length) {
            dispatch(fetchDatasetsDataTypes()).catch(console.error);
        }
    }, [dispatch, datasetsByID]);
    return useAppSelector((state) => state.datasetDataTypes);
};
