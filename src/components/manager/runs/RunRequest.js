import React from "react";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";

import {Descriptions, List, Tag} from "antd";

import ReactJson from "react-json-view";

import WorkflowListItem from "../WorkflowListItem";

const RunRequest = ({run}) => {
    const projectsById = useSelector((state) => state.projects.itemsByID);

    const details = run?.details;

    if (!details) return <div />;

    const runDataType = details.request.tags.workflow_metadata.data_type;

    const {project_id: projectId, dataset_id: datasetId} = details.request.tags;

    const project = projectsById[projectId] ?? null;
    const dataset = project ? (project.datasets.find(d => d.identifier === datasetId) ?? null) : null;

    const projectTitle = project?.title ?? null;
    const datasetTitle = dataset?.title ?? null;

    const projectIdFragment = <span style={{fontFamily: "monospace"}}>{projectId}</span>;
    const datasetIdFragment = <span style={{fontFamily: "monospace"}}>{datasetId}</span>;

    return <Descriptions bordered>
        {project !== null && (
            <Descriptions.Item label="Project" span={3}>
                {projectTitle ? <>{projectTitle} ({projectIdFragment})</> : projectIdFragment}
            </Descriptions.Item>
        )}
        {dataset !== null && (
            <Descriptions.Item label="Dataset" span={3}>
                {datasetTitle ? <>{datasetTitle} ({datasetIdFragment})</> : datasetIdFragment}
            </Descriptions.Item>
        )}
        {dataset !== null && (
            <Descriptions.Item label="Run Data Type" span={3}>
                <Tag>{runDataType}</Tag>
            </Descriptions.Item>
        )}
        <Descriptions.Item label="Parameters" span={3}>
            <ReactJson
                src={details.request.workflow_params}
                displayDataTypes={false}
                enableClipboard={false}
                name={null}
            />
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
            <ReactJson
                src={details.request.tags}
                displayDataTypes={false}
                enableClipboard={false}
                name={null}
            />
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
            }),
        }),
    }),
};

export default RunRequest;
