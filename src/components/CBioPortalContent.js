import React, {useEffect} from "react";

import {BENTO_CBIOPORTAL_PUBLIC_URL} from "../config";
import {SITE_NAME} from "../constants";


const CBioPortalContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - cBioPortal`;
    }, []);

    return <div style={{flex: "1", display: "flex", flexDirection: "column"}}>
        {BENTO_CBIOPORTAL_PUBLIC_URL && (
            <iframe src={BENTO_CBIOPORTAL_PUBLIC_URL} style={{
                width: "100%",
                border: "1px solid #CFCFCF",
                flex: "1",
            }}></iframe>
        )}
    </div>;
};

export default CBioPortalContent;
