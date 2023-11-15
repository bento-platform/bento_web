import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useHasResourcePermission } from "../../lib/auth/utils";
import { RESOURCE_EVERYTHING } from "../../lib/auth/resources";
import { viewDropBox } from "../../lib/auth/permissions";
import { fetchDropBoxTreeOrFail } from "../../modules/manager/actions";

export const useFetchDropBoxContentsIfAllowed = () => {
    const dispatch = useDispatch();
    const { hasPermission } = useHasResourcePermission(RESOURCE_EVERYTHING, viewDropBox);
    useEffect(() => {
        dispatch(fetchDropBoxTreeOrFail());
    }, [dispatch, hasPermission]);
};
