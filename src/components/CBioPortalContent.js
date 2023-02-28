import React, {useEffect} from "react";

import {SITE_NAME} from "../constants";


const CBioPortalContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - cBioPortal`;
    }, []);

    return <div />;
};

export default CBioPortalContent;
