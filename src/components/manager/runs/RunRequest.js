import React from "react";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";

import {Descriptions, List, Tag} from "antd";

import WorkflowListItem from "../WorkflowListItem";

const RunRequest = ({run}) => {
    const tablesByServiceID = useSelector(state => state.serviceTables.itemsByServiceID);

    const details = run?.details ?? {};

    const serviceID = details.request.tags.workflow_metadata.serviceID;
    const tableDataType = details.request.tags.workflow_metadata.data_type;
    const tableID = details.request.tags.table_id;
    const tableName = tablesByServiceID[serviceID]?.tablesByID?.[tableID]?.name;

    // TODO: Link to some "table" page from the table description item here

    const idFragment = <span style={{fontFamily: "monospace"}}>{tableID}</span>;

    return <Descriptions bordered>
        <Descriptions.Item label="Table" span={3}>
            <Tag>{tableDataType}</Tag> {tableName ? <>{tableName} ({idFragment})</> : idFragment}
        </Descriptions.Item>
        <Descriptions.Item label="Parameters" span={3}>
                <pre style={{margin: 0}}>{
                    JSON.stringify(details.request.workflow_params, null, 4)
                }</pre>
        </Descriptions.Item>
        <Descriptions.Item label="Workflow Type">
            {details.request.workflow_type}
        </Descriptions.Item>
        <Descriptions.Item label="Workflow Type Version">
            {details.request.workflow_type_version}
        </Descriptions.Item>
        <Descriptions.Item label="Workflow URL">
            <a href={details.request.workflow_url} target="_blank" rel="noopener noreferrer">
                {details.request.workflow_url}
            </a>
        </Descriptions.Item>
        <Descriptions.Item label="Workflow" span={3}>
            <List itemLayout="vertical">
                <WorkflowListItem workflow={details.request.tags.workflow_metadata} />
            </List>
        </Descriptions.Item>
        <Descriptions.Item label="Tags">
            <pre style={{margin: 0}}>{JSON.stringify(details.request.tags, null, 4)}</pre>
        </Descriptions.Item>
    </Descriptions>;
};

RunRequest.propTypes = {
    run: PropTypes.shape({
        details: PropTypes.shape({
            request: PropTypes.shape({
                workflow_type: PropTypes.string,
                workflow_type_version: PropTypes.string,
                workflow_url: PropTypes.string,
                tags: PropTypes.object,
            })
        })
    }),
};

export default RunRequest;
