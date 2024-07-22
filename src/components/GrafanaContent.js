import React, {useEffect} from "react";
import Iframe from "@nicholasadamou/react-iframe";

import {SITE_NAME} from "../constants";
import { useAccessToken } from "bento-auth-js";


const GrafanaContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Grafana`;
    }, []);

    const accessToken = useAccessToken();
    return <div style={{flex: "1", display: "flex", flexDirection: "column"}}>
            <Iframe
            src="https://portal.bentov2.local/api/grafana/login"
            headers={{
             Authorization: accessToken
            }}
            style={{
                width: "100%",
                border: "none",
                borderBottom: "2px solid #E6E6E6",
                flex: "1",
            }}
           />
    </div>;
};

export default GrafanaContent;
