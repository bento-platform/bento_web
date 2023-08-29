import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Modal, Skeleton, Tag } from "antd";

import { summaryPropTypesShape } from "../../../propTypes";

import GenericSummary from "./GenericSummary";
import PhenopacketSummary from "./PhenopacketSummary";
import VariantSummary from "./VariantSummary";

const DataTypeSummaryModal = ({dataType, summary, onCancel, visible}) => {
    if (!dataType) {
        return <></>;
    }

    const isFetchingSummaries = useSelector((state) => state.datasetDataTypes.isFetching);

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
        visible={visible}
        onCancel={onCancel}
        onOk={onCancel}
        title={<Tag>{dataType.id}</Tag>}
    >
        {(!summaryData || isFetchingSummaries)
            ? <Skeleton/>
            : <Summary summary={summaryData}/>}
    </Modal>;
};

DataTypeSummaryModal.propTypes = {
    dataType: PropTypes.object,
    summary: summaryPropTypesShape,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
};

export default DataTypeSummaryModal;
