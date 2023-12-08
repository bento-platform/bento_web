import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchReferenceGenomesIfNeeded } from "./actions";

export const useReferenceGenomes = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchReferenceGenomesIfNeeded());
    }, [dispatch]);
    return useSelector((state) => state.referenceGenomes);
};
