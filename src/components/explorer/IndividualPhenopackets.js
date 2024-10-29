import { useEffect } from "react";

import { Divider, Skeleton } from "antd";

import { fetchIndividualPhenopacketsIfNecessary } from "@/modules/metadata/actions";
import { individualPropTypesShape } from "@/propTypes";

import DownloadButton from "@/components/common/DownloadButton";
import JsonView from "@/components/common/JsonView";
import { useService } from "@/modules/services/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

const IndividualPhenopackets = ({ individual }) => {
  const dispatch = useAppDispatch();

  const { id: individualId } = individual;

  const katsuUrl = useService("metadata")?.url ?? "";
  const downloadUrl = `${katsuUrl}/api/individuals/${individualId}/phenopackets?attachment=1&format=json`;

  const { phenopacketsByIndividualID } = useAppSelector((state) => state.individuals);

  const { isFetching, data } = phenopacketsByIndividualID[individualId] ?? {};

  useEffect(() => {
    dispatch(fetchIndividualPhenopacketsIfNecessary(individualId));
  }, [dispatch, individualId]);

  return (
    <>
      <DownloadButton uri={downloadUrl} disabled={!katsuUrl}>
        Download JSON
      </DownloadButton>
      <Divider />
      {data === undefined || isFetching ? (
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
