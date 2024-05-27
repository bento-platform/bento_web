import { useEffect } from "react";
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
