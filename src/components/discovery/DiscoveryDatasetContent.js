import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Skeleton } from "antd";

import Dataset from "../datasets/Dataset";
import { projectPropTypesShape } from "../../propTypes";

const DiscoveryDatasetContent = ({
    match,
    projects,
    projectTablesByProjectID,
    serviceTablesByServiceID,
    isFetchingUserDependentData,
}) => {
    const datasetId = match.params.dataset || null;
    if (!datasetId || isFetchingUserDependentData) {
        // TODO: Nicer
        return <Skeleton />;
    }

    const project = projects.find((p) =>
        p.datasets.find((d) => d.identifier === datasetId)
    );
    if (!project) return null; // TODO: 404 or error

    // TODO: Deduplicate with RoutedProject
    const tables = serviceTablesByServiceID;
    const projectTableOwnershipRecords =
        projectTablesByProjectID[project.identifier] || [];

    const tableList = projectTableOwnershipRecords
        .filter((tableOwnership) =>
            (tables[tableOwnership.service_id] || {}).tablesByID.hasOwnProperty(
                tableOwnership.table_id
            )
        )
        .map((tableOwnership) => ({
            ...tableOwnership,
            ...tables[tableOwnership.service_id].tablesByID[
                tableOwnership.table_id
            ],
        }));

    const dataset = {
        ...project.datasets.find((d) => d.identifier === datasetId),
        tables: tableList.filter((t) => t.dataset === datasetId), // TODO: Filter how?
    };

    return <Dataset mode="public" value={dataset} project={project} />;
};

DiscoveryDatasetContent.propTypes = {
    projects: PropTypes.arrayOf(projectPropTypesShape),
    projectTablesByProjectID: PropTypes.object, // TODO: Shape
    serviceTablesByServiceID: PropTypes.object, // TODO: Shape
    isFetchingUserDependentData: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    projects: state.projects.items,
    projectTablesByProjectID: state.projectTables.itemsByProjectID,
    serviceTablesByServiceID: state.serviceTables.itemsByServiceID,
    isFetchingUserDependentData: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(withRouter(DiscoveryDatasetContent));
