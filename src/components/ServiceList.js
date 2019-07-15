import React from "react";
import {connect} from "react-redux";

import {Table, Typography, Icon, Tag} from "antd";

import "antd/es/icon/style/css";
import "antd/es/tag/style/css";
import "antd/es/table/style/css.js";

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        render: id => (
            <Typography.Text code>{id}</Typography.Text>
        )
    },
    {
        title: "Name",
        dataIndex: "name",
    },
    {
        title: "URL",
        dataIndex: "url",
        render: url => (
            <a href={`/api${url}`}>{`/api${url}`}</a>
        )
    },
    {
        title: "Data Service?",
        dataIndex: "metadata.chordDataService",
        render: dataService => (
            <Icon type={dataService ? "check" : "close"} />
        )
    },
    {
        title: "Status",
        dataIndex: "status",
        render: status => {
            let statusText = "";
            let color = "";
            switch (status) {
                case false: // error returned
                    statusText = "UNREACHABLE";
                    color = "red";
                    break;
                case null:  // unknown, not in record
                    statusText = "UNKNOWN";
                    color = "";
                    break;
                default: // reachable
                    statusText = "HEALTHY";
                    color = "green";
                    break;
            }

            return (
                <Tag color={color}>{statusText}</Tag>
            );
        }
    }
];

const ServiceList = connect(
    state => ({
        dataSource: state.services.items.map(service => ({
            ...service,
            status: Object.keys(state.serviceStatus.status).includes(service.id)
                ? state.serviceStatus.status[service.id]
                : null
        })),
        columns,
        rowKey: "id",
        bordered: true,
        loading: state.services.isFetching
    })
)(Table);

export default ServiceList;
