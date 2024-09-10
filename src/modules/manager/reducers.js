import { TOGGLE_PROJECT_CREATION_MODAL, PROJECT_EDITING } from "./actions";

export const manager = (
  state = {
    projectCreationModal: false,
    editingProject: false,
    jsonSchemaCreationModal: false,
  },
  action,
) => {
  switch (action.type) {
    case TOGGLE_PROJECT_CREATION_MODAL:
      return { ...state, projectCreationModal: !state.projectCreationModal };

    case PROJECT_EDITING.BEGIN:
      return { ...state, editingProject: true };

    case PROJECT_EDITING.END:
      return { ...state, editingProject: false };

    default:
      return state;
  }
};
