import {useMemo} from "react";
import {useSelector} from "react-redux";

export const buildUrlEncodedData = obj =>
    Object.entries(obj).reduce((params, [k, v]) => {
        if (v === null || v === undefined) return params;
        params.set(k, v.toString());
        return params;
    }, new URLSearchParams());

export const getIsAuthenticated = idTokenContents =>
    !!idTokenContents && Math.round((new Date()).getTime() / 1000) < idTokenContents.exp;

export const makeAuthorizationHeader = token => token ? {"Authorization": `Bearer ${token}`} : {};

export const useAuthorizationHeader = () => {
    const {accessToken} = useSelector(state => state.auth);
    return useMemo(
        () => accessToken => accessToken ? {"Authorization": `Bearer ${accessToken}`} : {},
        [accessToken]);
};
