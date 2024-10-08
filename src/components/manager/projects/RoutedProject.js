import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Modal } from "antd";

import DatasetFormModal from "../../datasets/DatasetFormModal";

import Project from "./Project";
import ProjectJsonSchemaModal from "./ProjectJsonSchemaModal";
import ProjectSkeleton from "./ProjectSkeleton";

import { FORM_MODE_ADD, FORM_MODE_EDIT } from "@/constants";
import { beginProjectEditing, endProjectEditing } from "@/modules/manager/actions";
import { deleteProjectIfPossible, saveProjectIfPossible } from "@/modules/metadata/actions";
import { useProjects } from "@/modules/metadata/hooks";
import { useAppDispatch, useAppSelector } from "@/store";

const RoutedProject = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { project: selectedProjectID } = useParams();

  const {
    itemsByID: projectsByID,
    isCreating: creatingProject,
    isFetching: fetchingProjects,
    isSaving: savingProject,
  } = useProjects();
  const loadingProjects = creatingProject || fetchingProjects;
  const editingProject = useAppSelector((state) => state.manager.editingProject);

  const [datasetAdditionModal, setDatasetAdditionModal] = useState(false);
  const [datasetEditModal, setDatasetEditModal] = useState(false);
  const [jsonSchemaModal, setJsonSchemaModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  const project = projectsByID[selectedProjectID];

  useEffect(() => {
    if (!projectsByID[selectedProjectID] && !loadingProjects) {
      navigate("/data/manager/projects/");
    }
  }, [navigate, projectsByID, loadingProjects, selectedProjectID]);

  useEffect(() => {
    // end project editing on project changes
    if (editingProject) {
      dispatch(endProjectEditing());
    }
    // Shouldn't trigger when editingProject flips to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedProjectID]);

  const showDatasetAdditionModal = useCallback(() => {
    setDatasetAdditionModal(true);
  }, []);

  const hideDatasetAdditionModal = useCallback(() => {
    setDatasetAdditionModal(false);
  }, []);

  const hideDatasetEditModal = useCallback(() => {
    setDatasetEditModal(false);
  }, []);

  const setJsonSchemaModalVisible = useCallback((visible) => {
    setJsonSchemaModal(visible);
  }, []);

  const handleProjectSave = useCallback((newProject) => dispatch(saveProjectIfPossible(newProject)), [dispatch]);

  const handleProjectDelete = useCallback(() => {
    if (!project) return;
    const deleteModal = Modal.confirm({
      title: `Are you sure you want to delete the "${project.title}" project?`,
      content: (
        <>
          All data contained in the project will be deleted permanently, and datasets will no longer be available for
          exploration.
        </>
      ),
      width: 576,
      autoFocusButton: "cancel",
      okText: "Delete",
      okType: "danger",
      maskClosable: true,
      onOk: async () => {
        deleteModal.update({ okButtonProps: { loading: true } });
        await dispatch(deleteProjectIfPossible(project));
        deleteModal.update({ okButtonProps: { loading: false } });
      },
    });
  }, [dispatch, project]);

  const handleDatasetEdit = useCallback((dataset) => {
    setSelectedDataset(dataset);
    setDatasetEditModal(true);
  }, []);

  if (!selectedProjectID) {
    return null;
  }

  if (!project) return <ProjectSkeleton />;
  return (
    <>
      <DatasetFormModal
        mode={FORM_MODE_ADD}
        project={project}
        open={datasetAdditionModal}
        onCancel={hideDatasetAdditionModal}
        onOk={hideDatasetAdditionModal}
      />

      <DatasetFormModal
        mode={FORM_MODE_EDIT}
        project={project}
        open={datasetEditModal}
        initialValue={selectedDataset}
        onCancel={hideDatasetEditModal}
        onOk={hideDatasetEditModal}
      />

      <ProjectJsonSchemaModal
        projectId={project.identifier}
        open={jsonSchemaModal}
        onOk={() => setJsonSchemaModalVisible(false)}
        onCancel={() => setJsonSchemaModalVisible(false)}
      />

      <Project
        value={project}
        editing={editingProject}
        saving={savingProject}
        onDelete={handleProjectDelete}
        onEdit={() => dispatch(beginProjectEditing())}
        onCancelEdit={() => dispatch(endProjectEditing())}
        onSave={handleProjectSave}
        onAddDataset={showDatasetAdditionModal}
        onEditDataset={handleDatasetEdit}
        onAddJsonSchema={() => setJsonSchemaModalVisible(true)}
      />
    </>
  );
};

export default RoutedProject;
