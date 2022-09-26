import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Modal} from "antd";

import DatasetFormModal from "../../datasets/DatasetFormModal";
import Project from "./Project";
import ProjectSkeleton from "./ProjectSkeleton";

import {deleteProjectIfPossible, saveProjectIfPossible} from "../../../modules/metadata/actions";
import {beginProjectEditing, endProjectEditing} from "../../../modules/manager/actions";
import {withBasePath} from "../../../utils/url";
import {FORM_MODE_ADD, FORM_MODE_EDIT} from "../../../constants";
import {projectPropTypesShape, serviceInfoPropTypesShape} from "../../../propTypes";

class RoutedProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetAdditionModal: false,
            datasetEditModal: false,
            selectedDataset: null
        };
    }

    componentDidMount() {
        this.showDatasetAdditionModal = this.showDatasetAdditionModal.bind(this);
        this.hideDatasetAdditionModal = this.hideDatasetAdditionModal.bind(this);
        this.hideDatasetEditModal = this.hideDatasetEditModal.bind(this);
        this.ingestIntoTable = this.ingestIntoTable.bind(this);
        this.exportDataset = this.exportDataset.bind(this);
        this.analyzeDataset = this.analyzeDataset.bind(this);
        this.handleDeleteProject = this.handleDeleteProject.bind(this);
    }

    // noinspection JSCheckFunctionSignatures
    componentDidUpdate() {
        if (!this.props.projectsByID[this.props.match.params.project] && !this.props.loadingProjects) {
            this.props.history.push(withBasePath("admin/data/manager/projects/"));
        }
    }

    ingestIntoTable(p, t) {
        this.props.history.push(withBasePath("admin/data/manager/ingestion"),
            {selectedTable: `${p.identifier}:${t.data_type}:${t.id}`});
    }

    exportDataset(dataset) {
        this.props.history.push(
            withBasePath("admin/data/manager/export"),
            {selectedDataset: `dataset:${dataset.identifier}`}
        );
    }

    analyzeDataset(dataset) {
        this.props.history.push(
            withBasePath("admin/data/manager/analyze"),
            {selectedDataset: `dataset:${dataset.identifier}`}
        );
    }

    handleProjectSave(project) {
        // TODO: Form validation for project
        this.props.saveProjectIfPossible(project);
    }

    showDatasetAdditionModal() {
        this.setState({datasetAdditionModal: true});
    }

    hideDatasetAdditionModal() {
        this.setState({datasetAdditionModal: false});
    }

    hideDatasetEditModal() {
        this.setState({datasetEditModal: false});
    }

    handleDeleteProject(project) {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${project.title}" project?`,
            content:
                <>
                    Deleting this project means all data contained in the project will be deleted
                    permanently, and datasets will no longer be available for discovery within the
                    CHORD federation. {/* TODO: Real terms and conditions */}
                </>,
            width: 576,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({okButtonProps: {loading: true}});
                await this.props.deleteProjectIfPossible(project);
                deleteModal.update({okButtonProps: {loading: false}});
            },
        });
    }

    render() {
        const selectedProjectID = this.props.match.params.project;
        if (selectedProjectID) {
            const project = this.props.projectsByID[this.props.match.params.project];
            if (!project) return <ProjectSkeleton />;

            const tables = this.props.serviceTablesByServiceID;

            /**
             * @typedef {Object} ProjectTable
             * @property {string} table_id
             * @property {string} service_id
             * @property {string} dataset
             * @property {string} data_type
             * @property {string} sample
             * @type {ProjectTable[]}
             */
            const projectTableRecords = this.props.projectTablesByProjectID[selectedProjectID] || [];

            const manageableDataTypes = this.props.services
                .filter(s =>
                    (s.metadata || {chordManageableTables: false}).chordManageableTables &&
                    (this.props.serviceDataTypesByServiceID[s.id] || {}).items)
                .flatMap(s => this.props.serviceDataTypesByServiceID[s.id].items.map(dt => dt.id));

            console.log("ptr", projectTableRecords);
            console.log("tbl", tables);

            const tableList = projectTableRecords
                .filter(tableOwnership =>
                    ((tables[tableOwnership.service_id] || {}).tablesByID || {})
                        .hasOwnProperty(tableOwnership.table_id))
                .map(tableOwnership => ({
                    ...tableOwnership,
                    ...tables[tableOwnership.service_id].tablesByID[tableOwnership.table_id],
                }));

            console.log("tll", tableList);

            // TODO: Inconsistent schemas
            const strayTables = [
                ...this.props.serviceTables.filter(t2 =>
                    !this.props.projectTables.map(to => to.table_id).includes(t2.id) &&
                    manageableDataTypes.includes(t2.data_type)).map(t => ({...t, table_id: t.id})),
                ...this.props.projectTables.filter(to => !this.props.servicesByID.hasOwnProperty(to.service_id))
            ];

            return <>
                <DatasetFormModal mode={FORM_MODE_ADD}
                                  project={project}
                                  visible={this.state.datasetAdditionModal}
                                  onCancel={this.hideDatasetAdditionModal}
                                  onOk={this.hideDatasetAdditionModal} />

                <DatasetFormModal mode={FORM_MODE_EDIT}
                                  project={project}
                                  visible={this.state.datasetEditModal}
                                  initialValue={this.state.selectedDataset}
                                  onCancel={this.hideDatasetEditModal}
                                  onOk={this.hideDatasetEditModal} />

                <Project value={project}
                         tables={tableList}
                         strayTables={strayTables}
                         editing={this.props.editingProject}
                         saving={this.props.savingProject}
                         onDelete={() => this.handleDeleteProject(project)}
                         onEdit={() => this.props.beginProjectEditing()}
                         onCancelEdit={() => this.props.endProjectEditing()}
                         onSave={project => this.handleProjectSave(project)}
                         onAddDataset={() => this.showDatasetAdditionModal()}
                         onEditDataset={dataset => this.setState({
                             selectedDataset: dataset,
                             datasetEditModal: true
                         })}
                         onDatasetExport={dataset => this.exportDataset(dataset)}
                         onDatasetAnalyze={dataset => this.analyzeDataset(dataset)}
                         onTableIngest={(p, t) => this.ingestIntoTable(p, t)} />
            </>;
        }

        return null;
    }
}

RoutedProject.propTypes = {
    editingProject: PropTypes.bool,
    savingProject: PropTypes.bool,

    services: PropTypes.arrayOf(serviceInfoPropTypesShape),
    servicesByID: PropTypes.objectOf(serviceInfoPropTypesShape),

    serviceDataTypesByServiceID: PropTypes.objectOf(PropTypes.shape({
        items: PropTypes.array,  // TODO: Shape
        itemsByID: PropTypes.object,  // TODO: Shape
        isFetching: PropTypes.bool,
    })),

    serviceTables: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    serviceTablesByServiceID: PropTypes.objectOf(PropTypes.object),  // TODO: Shape

    projects: PropTypes.arrayOf(projectPropTypesShape),
    projectsByID: PropTypes.objectOf(projectPropTypesShape),

    projectTables: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    projectTablesByProjectID: PropTypes.objectOf(PropTypes.array),  // TODO: Shape

    loadingProjects: PropTypes.bool,

    isDeletingProject: PropTypes.bool,

    beginProjectEditing: PropTypes.func,
    endProjectEditing: PropTypes.func,
    saveProjectIfPossible: PropTypes.func,
    deleteProjectIfPossible: PropTypes.func,
};

const mapStateToProps = state => ({
    editingProject: state.manager.editingProject,
    savingProject: state.projects.isSaving,

    services: state.services.items,
    servicesByID: state.services.itemsByID,

    serviceDataTypesByServiceID: state.serviceDataTypes.dataTypesByServiceID,

    serviceTables: state.serviceTables.items,
    serviceTablesByServiceID: state.serviceTables.itemsByServiceID,

    projects: state.projects.items,
    projectsByID: state.projects.itemsByID,

    projectTables: state.projectTables.items,
    projectTablesByProjectID: state.projectTables.itemsByProjectID,

    loadingProjects: state.projects.isAdding || state.projects.isFetching,

    isDeletingProject: state.projects.isDeleting,
});

export default connect(mapStateToProps, {
    beginProjectEditing,
    endProjectEditing,
    saveProjectIfPossible,
    deleteProjectIfPossible,
})(RoutedProject);
