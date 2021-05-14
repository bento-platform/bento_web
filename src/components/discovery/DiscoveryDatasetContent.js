import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Skeleton} from "antd";

import Dataset from "../datasets/Dataset";
import {projectPropTypesShape} from "../../propTypes";

class DiscoveryDatasetContent extends Component {
    render() {
        const datasetId = this.props.match.params.dataset || null;
        if (!datasetId || this.props.isFetchingUserDependentData) {
            // TODO: Nicer
            return <Skeleton />;
        }

        const project = this.props.projects.find(p => p.datasets.find(d => d.identifier === datasetId));
        if (!project) return null;  // TODO: 404 or error

        // TODO: Deduplicate with RoutedProject
        const tables = this.props.serviceTablesByServiceID;
        const projectTableOwnershipRecords = this.props.projectTablesByProjectID[project.identifier] || [];

        const tableList = projectTableOwnershipRecords
            .filter(tableOwnership =>
                (tables[tableOwnership.service_id] || {}).tablesByID.hasOwnProperty(tableOwnership.table_id))
            .map(tableOwnership => ({
                ...tableOwnership,
                ...tables[tableOwnership.service_id].tablesByID[tableOwnership.table_id],
            }));

        const dataset = {
            ...project.datasets.find(d => d.identifier === datasetId),
            tables: tableList.filter(t => t.dataset === datasetId),  // TODO: Filter how?
        };

        return <Dataset mode="public" value={dataset} project={project} />;
    }
}

DiscoveryDatasetContent.propTypes = {
    projects: PropTypes.arrayOf(projectPropTypesShape),
    projectTablesByProjectID: PropTypes.object,  // TODO: Shape
    serviceTablesByServiceID: PropTypes.object,  // TODO: Shape
    isFetchingUserDependentData: PropTypes.bool,
};

const mapStateToProps = state => ({
    projects: state.projects.items,
    projectTablesByProjectID: state.projectTables.itemsByProjectID,
    serviceTablesByServiceID: state.serviceTables.itemsByServiceID,
    isFetchingUserDependentData: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(withRouter(DiscoveryDatasetContent));
