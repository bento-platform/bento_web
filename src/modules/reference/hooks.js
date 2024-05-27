import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useService } from "@/modules/services/hooks";
import { fetchReferenceGenomesIfNeeded } from "./actions";


export const useReferenceGenomes = () => {
    const dispatch = useDispatch();
    const referenceService = useService("reference");
    useEffect(() => {
        dispatch(fetchReferenceGenomesIfNeeded());
    }, [dispatch, referenceService]);
    return useSelector((state) => state.referenceGenomes);
};


/**
 * @param {string | undefined} referenceGenomeID
 * @param {string | null | undefined} nameQuery
 */
export const useGeneNameSearch = (referenceGenomeID, nameQuery) => {
    const referenceService = useService("reference");

    const [hasAttempted, setHasAttempted] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!referenceService || !referenceGenomeID || !nameQuery) return;

        const params = new URLSearchParams({ name: nameQuery, name_fzy: "true", limit: "10" });
        const searchUrl = `${referenceService.url}/genomes/${referenceGenomeID}/features?${params.toString()}`;

        setError(null);

        (async () => {
            setIsFetching(true);

            try {
                const res = await fetch(searchUrl, { headers: { Accept: "application/json" } });
                const resData = await res.json();
                if (res.ok) {
                    console.debug("Genome feature search - got results:", resData.results);
                    setData(resData.results);
                } else {
                    setError(`Genome feature search failed with message: ${resData.message}`);
                }
            } catch (e) {
                console.error(e);
                setError(`Genome feature search failed: ${e.toString()}`);
            } finally {
                setIsFetching(false);
                setHasAttempted(true);
            }
        })();
    }, [referenceService, referenceGenomeID, nameQuery]);

    return { hasAttempted, isFetching, data, error };
};
