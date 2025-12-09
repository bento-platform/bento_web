import { useEffect } from "react";
import { Divider, Skeleton, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";

import { fetchIndividualPhenopacketsIfNecessary } from "@/modules/metadata/actions";
import { individualPropTypesShape } from "@/propTypes";

import JsonView from "@/components/common/JsonView";
import { useAppDispatch, useAppSelector } from "@/store";

const IndividualPhenopackets = ({ individual }) => {
  const dispatch = useAppDispatch();
  const { id: individualId } = individual;

  const { phenopacketsByIndividualID } = useAppSelector((state) => state.individuals);

  const { isFetching, data } = phenopacketsByIndividualID[individualId] ?? {};

  useEffect(() => {
    dispatch(fetchIndividualPhenopacketsIfNecessary(individualId));
  }, [dispatch, individualId]);

  const handleDownloadFromState = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, `phenopackets_${individualId}.json`);
  };

  return (
    <>
      <Button icon={<DownloadOutlined />} onClick={handleDownloadFromState} disabled={!data || isFetching}>
        Download JSON
      </Button>

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
