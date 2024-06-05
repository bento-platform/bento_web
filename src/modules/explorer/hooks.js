import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIgvGenomes } from "./actions";

export const useIgvGenomes = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchIgvGenomes());
    }, [dispatch]);
    return useSelector((state) => state.igvGenomes);
};
