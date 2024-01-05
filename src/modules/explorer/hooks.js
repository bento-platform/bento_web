import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIgvGenomesIfNeeded } from "./actions";

export const useIgvGenomes = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchIgvGenomesIfNeeded());
    }, [dispatch]);
    return useSelector((state) => state.igvGenomes);
};
