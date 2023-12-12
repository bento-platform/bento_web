import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHasResourcePermission, RESOURCE_EVERYTHING, viewDropBox } from "bento-auth-js";

import { fetchDropBoxTreeOrFail } from "../../modules/manager/actions";

export const useFetchDropBoxContentsIfAllowed = () => {
    const dispatch = useDispatch();
    const { hasPermission } = useHasResourcePermission(RESOURCE_EVERYTHING, viewDropBox);
    useEffect(() => {
        // If hasPermission changes to true, this will automatically dispatch the drop box fetch method.
        if (hasPermission) {
            dispatch(fetchDropBoxTreeOrFail());
        }
    }, [dispatch, hasPermission]);
};
