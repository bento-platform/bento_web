import { useEffect } from "react";

import { fetchIndividual } from "@/modules/metadata/actions";
import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

export const useIndividual = (individualID) => {
  const dispatch = useAppDispatch();

  const metadataService = useService("metadata");
  const individuals = useAppSelector((state) => state.individuals.itemsByID);

  useEffect(() => {
    if (metadataService && individualID) {
      // If we've loaded the metadata service, and we have an individual selected (or the individual ID changed),
      // we should load individual data.
      dispatch(fetchIndividual(individualID)).catch(console.error);
    }
  }, [dispatch, metadataService, individualID]);

  return individuals[individualID];
};
