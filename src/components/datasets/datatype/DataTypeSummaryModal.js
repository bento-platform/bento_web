import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Modal, Skeleton } from "antd";

import { summaryPropTypesShape } from "@/propTypes";

import GenericSummary from "./GenericSummary";
import PhenopacketSummary from "./PhenopacketSummary";
import VariantSummary from "./VariantSummary";

const DataTypeSummaryModal = ({dataType, summary, onCancel, open}) => {
    const isFetchingSummaries = useSelector((state) => state.datasetDataTypes.isFetchingAll);

    if (!dataType) {
        return <></>;
    }

    let Summary = GenericSummary;
    let summaryData = summary;
    switch (dataType.id) {
        case "variant":
            Summary = VariantSummary;
            break;
        case "phenopacket":
            Summary = PhenopacketSummary;
            break;
        default:
            summaryData = summary ?? dataType;
    }

    return <Modal
        open={open}
        onCancel={onCancel}
        onOk={onCancel}
        title={dataType.label ?? dataType.id}
        width={960}
        footer={null}
    >
        {(!summaryData || isFetchingSummaries)
            ? <Skeleton/>
            : <Summary summary={summaryData} />}
    </Modal>;
};

DataTypeSummaryModal.propTypes = {
    dataType: PropTypes.object,
    summary: summaryPropTypesShape,
    onCancel: PropTypes.func,
    open: PropTypes.bool,
};

export default DataTypeSummaryModal;
