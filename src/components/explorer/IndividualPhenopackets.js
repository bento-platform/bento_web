import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Divider, Skeleton } from "antd";
import ReactJson from "react-json-view";

import { fetchIndividualPhenopacketsIfNecessary } from "../../modules/metadata/actions";
import { individualPropTypesShape } from "../../propTypes";

import DownloadButton from "../DownloadButton";

const IndividualPhenopackets = ({ individual }) => {
    const dispatch = useDispatch();

    const katsuUrl = useSelector((state) => state.services.metadataService?.url ?? "");
    const downloadUrl = `${katsuUrl}/api/individuals/${individual.id}/phenopackets?attachment=1&format=json`;

    const { isFetching, data } = useSelector(
        (state) => state.individuals.phenopacketsByIndividualID[individual.id] ?? {},
    );

    useEffect(() => {
        dispatch(fetchIndividualPhenopacketsIfNecessary(individual.id));
    }, [individual]);

    return (
        <>
            <DownloadButton uri={downloadUrl} disabled={!katsuUrl}>Download JSON</DownloadButton>
            <Divider />
            {(data === undefined || isFetching) ? (
                <Skeleton title={false} loading={true} />
            ) : (
                <ReactJson
                    src={data ?? []}
                    collapsed={false}
                    displayDataTypes={false}
                    name={false}
                />
            )}
        </>
    );
};

IndividualPhenopackets.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualPhenopackets;
