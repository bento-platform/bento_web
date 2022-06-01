import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";

import { Modal } from "antd";

import DatasetFormModal from "../../datasets/DatasetFormModal";
import Project from "./Project";
import ProjectSkeleton from "./ProjectSkeleton";

import {
    deleteProjectIfPossible,
    saveProjectIfPossible,
} from "../../../modules/metadata/actions";
import {
    beginProjectEditing,
    endProjectEditing,
} from "../../../modules/manager/actions";
import { withBasePath } from "../../../utils/url";
import { FORM_MODE_ADD, FORM_MODE_EDIT } from "../../../constants";
import {
    projectPropTypesShape,
    serviceInfoPropTypesShape,
} from "../../../propTypes";

const RoutedProject = ({
    editingProject,
    savingProject,
    services,
    servicesByID,
    serviceDataTypesByServiceID,
    serviceTables,
    serviceTablesByServiceID,
    projectsByID,
    projectTables,
    projectTablesByProjectID,
    loadingProjects,
    beginProjectEditing,
    endProjectEditing,
    saveProjectIfPossible,
    deleteProjectIfPossible,
    match,
}) => {
    const [datasetAdditionModal, setDatasetAdditionModal] = useState(false);
    const [datasetEditModal, setDatasetEditModal] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState(null);

    const history = useHistory();

    useEffect(() => {
        if (!projectsByID[match.params.project] && !loadingProjects) {
            history.push(withBasePath("admin/data/manager/projects/"));
        }
    }, [match.params.propTypes, loadingProjects]);

    const ingestIntoTable = (p, t) => {
        history.push(withBasePath("admin/data/manager/ingestion"), {
            selectedTable: `${p.identifier}:${t.data_type}:${t.id}`,
        });
    };

    const handleProjectSave = (project) => {
        // TODO: Form validation for project
        saveProjectIfPossible(project);
    };

    const showDatasetAdditionModal = () => {
        setDatasetAdditionModal(true);
    };

    const hideDatasetAdditionModal = () => {
        setDatasetAdditionModal(false);
    };

    const hideDatasetEditModal = () => {
        setDatasetEditModal(false);
    };

    const handleDeleteProject = (project) => {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${project.title}" project?`,
            content: (
                <>
                    Deleting this project means all data contained in the
                    project will be deleted permanently, and datasets will no
                    longer be available for discovery within the CHORD
                    federation. {/* TODO: Real terms and conditions */}
                </>
            ),
            width: 576,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({ okButtonProps: { loading: true } });
                await deleteProjectIfPossible(project);
                deleteModal.update({ okButtonProps: { loading: false } });
            },
        });
    };

    const selectedProjectID = match.params.project;
    if (selectedProjectID) {
        const project = projectsByID[match.params.project];
        if (!project) return <ProjectSkeleton />;

        const tables = serviceTablesByServiceID;

        /**
         * @typedef {Object} ProjectTable
         * @property {string} table_id
         * @property {string} service_id
         * @property {string} dataset
         * @property {string} data_type
         * @property {string} sample
         * @type {ProjectTable[]}
         */
        const projectTableRecords =
            projectTablesByProjectID[selectedProjectID] || [];

        const manageableDataTypes = services
            .filter(
                (s) =>
                    (s.metadata || { chordManageableTables: false })
                        .chordManageableTables &&
                    (serviceDataTypesByServiceID[s.id] || {}).items
            )
            .flatMap((s) =>
                serviceDataTypesByServiceID[s.id].items.map((dt) => dt.id)
            );

        console.log("ptr", projectTableRecords);
        console.log("tbl", tables);

        const tableList = projectTableRecords
            .filter((tableOwnership) =>
                (
                    (tables[tableOwnership.service_id] || {}).tablesByID || {}
                ).hasOwnProperty(tableOwnership.table_id)
            )
            .map((tableOwnership) => ({
                ...tableOwnership,
                ...tables[tableOwnership.service_id].tablesByID[
                    tableOwnership.table_id
                ],
            }));

        console.log("tll", tableList);

        // TODO: Inconsistent schemas
        const strayTables = [
            ...serviceTables
                .filter(
                    (t2) =>
                        !projectTables
                            .map((to) => to.table_id)
                            .includes(t2.id) &&
                        manageableDataTypes.includes(t2.data_type)
                )
                .map((t) => ({ ...t, table_id: t.id })),
            ...projectTables.filter(
                (to) => !servicesByID.hasOwnProperty(to.service_id)
            ),
        ];

        return (
            <>
                <DatasetFormModal
                    mode={FORM_MODE_ADD}
                    project={project}
                    visible={datasetAdditionModal}
                    onCancel={hideDatasetAdditionModal}
                    onOk={hideDatasetAdditionModal}
                />

                <DatasetFormModal
                    mode={FORM_MODE_EDIT}
                    project={project}
                    visible={datasetEditModal}
                    initialValue={selectedDataset}
                    onCancel={hideDatasetEditModal}
                    onOk={hideDatasetEditModal}
                />

                <Project
                    value={project}
                    tables={tableList}
                    strayTables={strayTables}
                    editing={editingProject}
                    saving={savingProject}
                    onDelete={() => handleDeleteProject(project)}
                    onEdit={() => beginProjectEditing()}
                    onCancelEdit={() => endProjectEditing()}
                    onSave={(project) => handleProjectSave(project)}
                    onAddDataset={() => showDatasetAdditionModal()}
                    onEditDataset={(dataset) => {
                        setSelectedDataset(dataset);
                        setDatasetEditModal(true);
                    }}
                    onTableIngest={(p, t) => ingestIntoTable(p, t)}
                />
            </>
        );
    }

    return null;
};

RoutedProject.propTypes = {
    editingProject: PropTypes.bool,
    savingProject: PropTypes.bool,

    services: PropTypes.arrayOf(serviceInfoPropTypesShape),
    servicesByID: PropTypes.objectOf(serviceInfoPropTypesShape),

    serviceDataTypesByServiceID: PropTypes.objectOf(
        PropTypes.shape({
            items: PropTypes.array, // TODO: Shape
            itemsByID: PropTypes.object, // TODO: Shape
            isFetching: PropTypes.bool,
        })
    ),

    serviceTables: PropTypes.arrayOf(PropTypes.object), // TODO: Shape
    serviceTablesByServiceID: PropTypes.objectOf(PropTypes.object), // TODO: Shape

    projectsByID: PropTypes.objectOf(projectPropTypesShape),

    projectTables: PropTypes.arrayOf(PropTypes.object), // TODO: Shape
    projectTablesByProjectID: PropTypes.objectOf(PropTypes.object), // TODO: Shape

    loadingProjects: PropTypes.bool,

    beginProjectEditing: PropTypes.func,
    endProjectEditing: PropTypes.func,
    saveProjectIfPossible: PropTypes.func,
    deleteProjectIfPossible: PropTypes.func,
};

const mapStateToProps = (state) => ({
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
