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


export const useResources = (individual) => {
    const dispatch = useDispatch();

    // TODO: when individual belongs to a single dataset, use that instead
    const individualDatasets = useMemo(
        () => (individual?.phenopackets ?? []).map(p => p.dataset),
        [individual]);

    const datasetResources = useSelector((state) => state.datasetResources.itemsByID);

    useEffect(() => {
        individualDatasets.map((d) => dispatch(fetchDatasetResourcesIfNecessary(d)));
    }, [dispatch, individualDatasets]);

    return useMemo(
        () =>
            Object.values(
                Object.fromEntries(
                    individualDatasets
                        .flatMap(d => datasetResources[d]?.data ?? [])
                        .map(r => [r.id, r]),
                ),
            ),
        [datasetResources, individualDatasets],
    );
};


export const useResourcesByNamespacePrefix = (individual) => {
    const resources = useResources(individual);
    return useMemo(
        () => Object.fromEntries(resources.map(r => [r.namespace_prefix, r])),
        [individual],
    );
};

export const ontologyTermSorter = (k) => (a, b) => {
    if (a[k]?.label && b[k]?.label) {
        return a[k].label.toString().localeCompare(b[k].label.toString());
    }
    return 0;
};
