import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESOURCE_EVERYTHING, viewDropBox } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { fetchDropBoxTree } from "./actions";
import { fetchIndividual } from "@/modules/metadata/actions";


export const useDropBox = () => {
    const dispatch = useDispatch();

    const dropBox = useService("drop-box");  // TODO: associate this with the network action somehow
    const { hasPermission } = useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, viewDropBox);

    useEffect(() => {
        // If hasPermission changes to true, this will automatically dispatch the drop box tree fetch method.
        if (hasPermission) {
            dispatch(fetchDropBoxTree()).catch((err) => console.error(err));
        }
    }, [dispatch, dropBox, hasPermission]);

    return useSelector((state) => state.dropBox);
};


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
