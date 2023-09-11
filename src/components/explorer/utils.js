import {useMemo} from "react";

export const useDeduplicatedIndividualBiosamples = (individual) =>
    useMemo(
        () => Object.values(
            Object.fromEntries(
                (individual || {}).phenopackets
                    .flatMap(p => p.biosamples)
                    .map(b => [b.id, b]),
            ),
        ),
        [individual]
    );


export const useResources = (individual) =>
    useMemo(
        () =>
            Object.values(
                Object.fromEntries(
                    (individual?.phenopackets ?? [])
                        .flatMap(p => p.meta_data.resources ?? [])
                        .map(r => [r.id, r]),
                ),
            ),
        [individual],
    );


export const useResourcesByNamespacePrefix = (individual) => {
    const resources = useResources(individual);
    return useMemo(
        () => Object.fromEntries(resources.map(r => [r.namespace_prefix, r])),
        [individual]
    );
};

export const ontologyTermSorter = (k) => (a, b) => {
    if (a[k]?.label && b[k]?.label) {
        return a[k].label.toString().localeCompare(b[k].label.toString());
    }
    return 0;
};
