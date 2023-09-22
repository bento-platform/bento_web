import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDatasetResourcesIfNecessary } from "../../modules/datasets/actions";

export const useDeduplicatedIndividualBiosamples = (individual) =>
    useMemo(
        () => Object.values(
            Object.fromEntries(
                (individual || {}).phenopackets
                    .flatMap(p => p.biosamples)
                    .map(b => [b.id, b]),
            ),
        ),
        [individual],
    );


export const useDatasetResources = (datasetIDOrDatasetIDs) => {
    const dispatch = useDispatch();

    const datasetResources = useSelector((state) => state.datasetResources.itemsByID);

    const datasetIDs = useMemo(
        () => Array.isArray(datasetIDOrDatasetIDs) ? datasetIDOrDatasetIDs : [datasetIDOrDatasetIDs],
    [datasetIDOrDatasetIDs],
    );

    useEffect(() => {
        datasetIDs.map((d) => dispatch(fetchDatasetResourcesIfNecessary(d)));
    }, [dispatch, datasetIDs]);

    return useMemo(
        () => {
            const r = Object.values(
                Object.fromEntries(
                    datasetIDs
                        .flatMap(d => datasetResources[d]?.data ?? [])
                        .map(r => [r.id, r]),
                ),
            );
            const fetching = datasetIDs.reduce((flag, d) => flag || datasetResources[d]?.isFetching, false);
            return [r, fetching];
        },
        [datasetResources, datasetIDs],
    );
};

export const useIndividualResources = (individual) => {
    // TODO: when individual belongs to a single dataset, use that instead
    const individualDatasets = useMemo(
        () => (individual?.phenopackets ?? []).map(p => p.dataset),
        [individual]);

    return useDatasetResources(individualDatasets);
};

export const useResourcesByNamespacePrefix = ([resources, isFetching]) => {
    return useMemo(
        () => [
            Object.fromEntries(resources.map(r => [r.namespace_prefix, r])),
            isFetching,
        ],
        [resources, isFetching],
    );
};

export const ontologyTermSorter = (k) => (a, b) => {
    if (a[k]?.label && b[k]?.label) {
        return a[k].label.toString().localeCompare(b[k].label.toString());
    }
    return 0;
};
