import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchIndividual } from "@/modules/metadata/actions";
import { useService } from "@/modules/services/hooks";

export const useIndividual = (individualID) => {
  const dispatch = useDispatch();

  const metadataService = useService("metadata");
  const individuals = useSelector((state) => state.individuals.itemsByID);

  useEffect(() => {
    if (metadataService && individualID) {
      // If we've loaded the metadata service, and we have an individual selected (or the individual ID changed),
      // we should load individual data.
      dispatch(fetchIndividual(individualID)).catch(console.error);
    }
  }, [dispatch, metadataService, individualID]);

  return individuals[individualID];
};
