import {
    TOGGLE_PROJECT_CREATION_MODAL,
    PROJECT_EDITING,
    FETCH_DROP_BOX_TREE,
} from "./actions";


export const manager = (
    state = {
        projectCreationModal: false,
        editingProject: false,
    },
    action,
) => {
    switch (action.type) {
        case TOGGLE_PROJECT_CREATION_MODAL:
            return {...state, projectCreationModal: !state.projectCreationModal};

        case PROJECT_EDITING.BEGIN:
            return {...state, editingProject: true};

        case PROJECT_EDITING.END:
            return {...state, editingProject: false};

        default:
            return state;
    }
};

export const dropBox = (
    state = {
        isFetching: true,
        tree: [],
    },
    action,
) => {
    switch (action.type) {
        case FETCH_DROP_BOX_TREE.REQUEST:
            return {...state, isFetching: true};
        case FETCH_DROP_BOX_TREE.RECEIVE:
            return {...state, tree: action.data};
        case FETCH_DROP_BOX_TREE.FINISH:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
