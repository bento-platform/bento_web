import {useMemo} from "react";

export const useDeduplicatedIndividualBiosamples = (individual) =>
    useMemo(() => Object.values(
        Object.fromEntries(
            (individual || {}).phenopackets
                .flatMap(p => p.biosamples)
                .map(b => [b.id, b]),
        ),
    ), [individual]);
