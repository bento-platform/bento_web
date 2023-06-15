import {useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchResourcePermissionsIfPossibleAndNeeded} from "../../modules/auth/actions";
import {makeResourceKey} from "./resources";

export const buildUrlEncodedData = obj =>
    Object.entries(obj).reduce((params, [k, v]) => {
        if (v === null || v === undefined) return params;
        params.set(k, v.toString());
        return params;
    }, new URLSearchParams());

export const getIsAuthenticated = idTokenContents =>
    !!idTokenContents && Math.round((new Date()).getTime() / 1000) < idTokenContents.exp;

export const makeAuthorizationHeader = token => token ? {"Authorization": `Bearer ${token}`} : {};

// TODO: move hooks to own file

export const useAuthorizationHeader = () => {
    const {accessToken} = useSelector(state => state.auth);
    return useMemo(() => accessToken ? {"Authorization": `Bearer ${accessToken}`} : {}, [accessToken]);
};

export const useResourcePermissions = (resource) => {
    const dispatch = useDispatch();

    const haveAuthorizationService = !!useSelector(state => state.services.itemsByKind.authorization);

    useEffect(() => {
        if (!haveAuthorizationService) return;
        dispatch(fetchResourcePermissionsIfPossibleAndNeeded(resource));
    }, [haveAuthorizationService, resource]);

    const key = useMemo(() => makeResourceKey(resource), [resource]);

    const {
        permissions,
        isFetching,
        hasAttempted,
        error,
    } = useSelector(state => state.auth.resourcePermissions[key]) ?? {};

    return {
        permissions: permissions ?? [],
        isFetching: isFetching ?? false,
        hasAttempted: hasAttempted ?? false,
        error: error ?? "",
    };
};

export const useHasResourcePermission = (resource, permission) => {
    const {permissions, isFetching} = useResourcePermissions(resource) ?? {};
    return {isFetching, hasPermission: permissions.includes(permission)};
};
