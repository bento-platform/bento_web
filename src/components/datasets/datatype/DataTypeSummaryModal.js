import { Modal, Skeleton, Tag } from "antd";
import React from "react";
import PropTypes from "prop-types";
import { summaryPropTypesShape } from "../../../propTypes";
import GenericSummary from "./GenericSummary";
import PhenopacketSummary from "./PhenopacketSummary";
import VariantSummary from "./VariantSummary";
import { useSelector } from "react-redux";

const DataTypeSummaryModal = ({dataType, summary, onCancel, visible}) => {
    summary = summary || {};
    dataType = dataType || {};

    const isFetchingSummaries = useSelector((state) => state.datasetDataTypes.isFetching);

    let Summary = GenericSummary;
    switch (dataType.id) {
        case "variant":
            // TODO: variant summary
            Summary = VariantSummary;
            break;
        case "phenopacket":
            Summary = PhenopacketSummary;
            break;
    }

    return (
        <>
            <Modal visible={visible}
                   onCancel={onCancel}
                   onOk={onCancel}
                   title={<>
                    <Tag>{dataType.id}</Tag>
                   </>}
            >
                {(!summary || isFetchingSummaries)
                    ? <Skeleton/>
                    : <Summary summary={summary}/>}
            </Modal>
        </>
    );
};

DataTypeSummaryModal.propTypes = {
    dataType: PropTypes.object,
    summary: summaryPropTypesShape,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
};

export default DataTypeSummaryModal;
