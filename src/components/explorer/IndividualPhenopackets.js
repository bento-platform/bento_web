import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Divider, Skeleton } from "antd";

import { fetchIndividualPhenopacketsIfNecessary } from "@/modules/metadata/actions";
import { individualPropTypesShape } from "@/propTypes";

import DownloadButton from "@/components/DownloadButton";
import JsonView from "@/components/JsonView";

const IndividualPhenopackets = ({ individual }) => {
    const dispatch = useDispatch();

    const { id: individualId } = individual;

    const katsuUrl = useSelector((state) => state.services.metadataService?.url ?? "");
    const downloadUrl = `${katsuUrl}/api/individuals/${individualId}/phenopackets?attachment=1&format=json`;

    const phenopacketsByIndividualID = useSelector((state) => state.individuals.phenopacketsByIndividualID);

    const { isFetching, data } = phenopacketsByIndividualID[individualId] ?? {};

    useEffect(() => {
        dispatch(fetchIndividualPhenopacketsIfNecessary(individualId));
    }, [individualId]);

    return (
        <>
            <DownloadButton uri={downloadUrl} disabled={!katsuUrl}>Download JSON</DownloadButton>
            <Divider />
            {(data === undefined || isFetching) ? (
                <Skeleton title={false} loading={true} />
            ) : (
                <JsonView src={data ?? []} collapsed={false} />
            )}
        </>
    );
};

IndividualPhenopackets.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualPhenopackets;
