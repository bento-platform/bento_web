import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESOURCE_EVERYTHING, viewDropBox } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { fetchDropBoxTree } from "./actions";


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
