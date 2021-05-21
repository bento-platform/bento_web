import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";

import {Col, Divider, Row, Spin, Statistic, Typography} from "antd";

import {datasetPropTypesShape, projectPropTypesShape} from "../../propTypes";

class DatasetOverview extends Component {
    render() {
        const project = this.props.project || {};
        const dataset = this.props.dataset || {};
        return <>
            {(dataset.description || "").length > 0
                ? (<>
                    <Typography.Title level={4}>Description</Typography.Title>
                    {dataset.description.split("\n").map((p, i) =>
                        <Typography.Paragraph key={i}>{p}</Typography.Paragraph>)}
                </>) : null}
            {(dataset.contact_info || "").length > 0
                ? (<>
                    <Typography.Title level={4}>Contact Information</Typography.Title>
                    <Typography.Paragraph>
                        {dataset.contact_info.split("\n").map((p, i) =>
                            <Fragment key={i}>{p}<br /></Fragment>)}
                    </Typography.Paragraph>
                </>) : null}
            {((dataset.description || "").length > 0 || (dataset.contact_info || "").length > 0)
                ? <Divider /> : null}
            <Row gutter={16} style={{maxWidth: this.props.isPrivate ? "720px" : "1080px"}}>
                {this.props.isPrivate ? null : (
                    <Col span={8}><Statistic title="Project" value={project.title || "—"} /></Col>
                )}
                <Col span={this.props.isPrivate ? 12 : 8}>
                    <Statistic title="Created"
                               value={(new Date(Date.parse(dataset.created))).toLocaleString()} />
                </Col>
                <Col span={this.props.isPrivate ? 12 : 8}>
                    <Spin spinning={this.props.isFetchingTables}>
                        <Statistic title="Tables"
                                   value={this.props.isFetchingTables ? "—" : dataset.tables.length} />
                    </Spin>
                </Col>
            </Row>
        </>;
    }
}

DatasetOverview.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    isFetchingTables: PropTypes.bool,
};

export default DatasetOverview;
