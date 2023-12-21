import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchReferenceGenomesIfNeeded } from "./actions";

export const useReferenceGenomes = () => {
    const dispatch = useDispatch();
    const referenceService = useSelector((state) => state.services.itemsByKind.reference);
    useEffect(() => {
        if (referenceService) {
            dispatch(fetchReferenceGenomesIfNeeded());
        }
    }, [dispatch, referenceService]);
    return useSelector((state) => state.referenceGenomes);
};
