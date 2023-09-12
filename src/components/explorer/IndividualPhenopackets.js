import React from "react";
import { useSelector } from "react-redux";

import { Divider } from "antd";
import ReactJson from "react-json-view";

import { individualPropTypesShape } from "../../propTypes";

import DownloadButton from "../DownloadButton";

const IndividualPhenopackets = ({ individual }) => {
    const katsuUrl = useSelector((state) => state.services.metadataService?.url ?? "");
    const downloadUrl = `${katsuUrl}/api/individuals/${individual.id}/phenopackets?attachment=1&format=json`;

    console.log(downloadUrl);

    return (
        <>
            <DownloadButton uri={downloadUrl} disabled={!katsuUrl}>Download JSON</DownloadButton>
            <Divider />
            <ReactJson
                src={individual.phenopackets}
                collapsed={false}
                displayDataTypes={false}
                name={false}
            />
        </>
    );
};

IndividualPhenopackets.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualPhenopackets;
