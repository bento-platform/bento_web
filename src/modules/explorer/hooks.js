import { useEffect } from "react";
import { useSelector } from "react-redux";

import { useService } from "@/modules/services/hooks";
import { useAppDispatch } from "@/store";

import { fetchIgvGenomes, performGetGohanVariantsOverviewIfPossible } from "./actions";

export const useIgvGenomes = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchIgvGenomes());
    }, [dispatch]);
    return useSelector((state) => state.igvGenomes);
};

export const useGohanVariantsOverview = () => {
    const dispatch = useAppDispatch();
    const gohan = useService("gohan");

    useEffect(() => {
        if (gohan) {
            dispatch(performGetGohanVariantsOverviewIfPossible()).catch(console.error);
        }
    }, [dispatch, gohan]);

    return useSelector((state) => state.explorer.variantsOverviewResponse);
};
