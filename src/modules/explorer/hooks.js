import { useEffect } from "react";

import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

import { fetchIgvGenomes, performGetGohanVariantsOverviewIfPossible } from "./actions";

export const useIgvGenomes = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchIgvGenomes());
  }, [dispatch]);
  return useAppSelector((state) => state.igvGenomes);
};

export const useGohanVariantsOverview = () => {
  const dispatch = useAppDispatch();
  const gohan = useService("gohan");

  useEffect(() => {
    if (gohan) {
      dispatch(performGetGohanVariantsOverviewIfPossible()).catch(console.error);
    }
  }, [dispatch, gohan]);

  const { variantsOverviewResponse: data, fetchingVariantsOverview: isFetching } = useAppSelector(
    (state) => state.explorer,
  );

  return { data, isFetching };
};
