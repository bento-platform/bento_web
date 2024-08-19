import { basicAction, createFlowActionTypes } from "@/utils/actions";

export const TOGGLE_PROJECT_CREATION_MODAL = "TOGGLE_PROJECT_CREATION_MODAL";

export const PROJECT_EDITING = createFlowActionTypes("PROJECT_EDITING");

export const toggleProjectCreationModal = basicAction(TOGGLE_PROJECT_CREATION_MODAL);

export const beginProjectEditing = basicAction(PROJECT_EDITING.BEGIN);
export const endProjectEditing = basicAction(PROJECT_EDITING.END);
