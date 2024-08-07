import React, {useEffect} from "react";

import {SITE_NAME} from "../constants";
import {BENTO_GRAFANA_URL} from "../config"


const GrafanaContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Grafana`;
    }, []);

    return <div style={{flex: "1", display: "flex", flexDirection: "column"}}>
        {BENTO_GRAFANA_URL && (
            <iframe src={BENTO_GRAFANA_URL} style={{
                width: "100%",
                border: "none",
                borderBottom: "2px solid #E6E6E6",
                flex: "1",
            }}></iframe>
        )}
    </div>;
};

export default GrafanaContent;
