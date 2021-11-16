import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Link} from "react-router-dom";

import {Table, Typography, Icon, Tag} from "antd";

import {chordServicePropTypesMixin, serviceInfoPropTypesShape} from "../propTypes";
import {ROLE_OWNER} from "../constants";
import {withBasePath} from "../utils/url";

const ARTIFACT_STYLING = {fontFamily: "monospace"};

// biggest reasonable size limit before rolling over 
// currently 11 services including gohan
const MAX_TABLE_PAGE_SIZE = 12;

const serviceColumns = isOwner => [
    {
        title: "Artifact",
        dataIndex: "type.artifact",
        render: artifact => artifact
            ? (isOwner
                ? <Link style={ARTIFACT_STYLING} to={withBasePath(`admin/services/${artifact}`)}>{artifact}</Link>
                : <span style={ARTIFACT_STYLING}>{artifact}</span>)
            : ""
    },
    {
        title: "Name",
        dataIndex: "serviceInfo.name",
    },
    {
        title: "Version",
        dataIndex: "serviceInfo.version",
        render: version => <Typography.Text>{version || "-"}</Typography.Text>
    },
    {
        title: "URL",
        dataIndex: "serviceInfo.url",
        render: url => <a href={url}>{url}</a>
    },
    {
        title: "Data Service?",
        dataIndex: "data_service",
        render: dataService => <Icon type={dataService ? "check" : "close"} />
    },
    {
        title: "Status",
        dataIndex: "status",
        render: (status, service) => service.loading
            ? <Tag>LOADING</Tag>
            : <Tag color={status ? "green" : "red"}>{status ? "HEALTHY" : "ERROR"}</Tag>
    }
];

class ServiceList extends Component {
    render() {
        return <Table {...this.props} />;
    }
}

ServiceList.propTypes = {
    dataSource: PropTypes.arrayOf(PropTypes.shape({
        ...chordServicePropTypesMixin,
        key: PropTypes.string,
        serviceInfo: serviceInfoPropTypesShape,
        status: PropTypes.bool,
        loading: PropTypes.bool,
    }))
};

const mapStateToProps = state => ({
    dataSource: state.chordServices.items.map(service => ({
        ...service,
        key: `${service.type.organization}:${service.type.artifact}`,
        serviceInfo: state.services.itemsByArtifact[service.type.artifact] || null,
        status: state.services.itemsByArtifact.hasOwnProperty(service.type.artifact),
        loading: state.services.isFetching
    })),
    columns: serviceColumns(state.auth.hasAttempted && (state.auth.user || {}).chord_user_role === ROLE_OWNER),
    rowKey: "key",
    bordered: true,
    loading: state.chordServices.isFetching || state.services.isFetching,
    size: "middle",
    pagination: {"defaultPageSize": MAX_TABLE_PAGE_SIZE},
});

export default connect(mapStateToProps)(ServiceList);
