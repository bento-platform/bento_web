import React from "react";
import PropTypes from "prop-types";

import { useAutoAuthenticate } from "bento-auth-js";
import SitePageLoading from "./SitePageLoading";
import { useOpenIDConfigNotLoaded } from "@/hooks";

const AutoAuthenticate = ({ children }) => {
    const { isAutoAuthenticating } = useAutoAuthenticate();
    const openIdConfigNotLoaded = useOpenIDConfigNotLoaded();

    if (openIdConfigNotLoaded || isAutoAuthenticating) {
        return <SitePageLoading />;
    }

    return children;
};
AutoAuthenticate.propTypes = {
    children: PropTypes.node,
};

export default AutoAuthenticate;
