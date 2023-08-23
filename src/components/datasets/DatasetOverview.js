import React, {Fragment, useMemo} from "react";
import PropTypes from "prop-types";

import {Col, Divider, Row, Spin, Statistic, Typography} from "antd";

import {datasetPropTypesShape, projectPropTypesShape} from "../../propTypes";

import {EM_DASH} from "../../constants";
import { useSelector } from "react-redux";

const DatasetOverview = ({isPrivate, project, dataset}) => {
    const datasetsDataTypes = useSelector((state) => state.datasetDataTypes.itemsById);
    const dataTypesSummary = Object.values(datasetsDataTypes[dataset.identifier]?.itemsById || {});
    const isFetchingDataset = datasetsDataTypes[dataset.identifier]?.isFetching;

    // Count data types which actually have data in them for showing in the overview
    const dataTypeCount = useMemo(
        () => dataTypesSummary
            .filter((value) => (value.count || 0) > 0)
            .length,
        [dataTypesSummary]);

    return <>
        {(dataset.description ?? "").length > 0
            ? (<>
                <Typography.Title level={4}>Description</Typography.Title>
                {dataset.description.split("\n").map((p, i) =>
                    <Typography.Paragraph key={i}>{p}</Typography.Paragraph>)}
            </>) : null}
        {(dataset.contact_info ?? "").length > 0
            ? (<>
                <Typography.Title level={4}>Contact Information</Typography.Title>
                <Typography.Paragraph>
                    {dataset.contact_info.split("\n").map((p, i) =>
                        <Fragment key={i}>{p}<br /></Fragment>)}
                </Typography.Paragraph>
            </>) : null}
        {((dataset.description ?? "").length > 0 || (dataset.contact_info ?? "").length > 0)
            ? <Divider /> : null}
        <Row gutter={16} style={{maxWidth: isPrivate ? "720px" : "1080px"}}>
            {isPrivate ? null : (
                <Col span={8}><Statistic title="Project" value={project.title ?? EM_DASH} /></Col>
            )}
            <Col span={isPrivate ? 12 : 8}>
                <Statistic title="Created"
                           value={(new Date(Date.parse(dataset.created))).toLocaleString()} />
            </Col>
            <Col span={isPrivate ? 12 : 8}>
                <Spin spinning={isFetchingDataset}>
                    <Statistic title="Data types"
                               value={isFetchingDataset ? EM_DASH : dataTypeCount} />
                </Spin>
            </Col>
        </Row>
    </>;
};

DatasetOverview.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
};

export default DatasetOverview;
