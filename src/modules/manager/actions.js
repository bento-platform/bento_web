import {message} from "antd";

import {
    basicAction,
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,
} from "../../utils/actions";


export const TOGGLE_PROJECT_CREATION_MODAL = "TOGGLE_PROJECT_CREATION_MODAL";

export const PROJECT_EDITING = createFlowActionTypes("PROJECT_EDITING");

export const FETCH_DROP_BOX_TREE = createNetworkActionTypes("FETCH_DROP_BOX_TREE");
export const PUT_DROP_BOX_OBJECT = createNetworkActionTypes("PUT_DROP_BOX_OBJECT");
export const DELETE_DROP_BOX_OBJECT = createNetworkActionTypes("DELETE_DROP_BOX_OBJECT");

export const DROP_BOX_PUTTING_OBJECTS = createFlowActionTypes("DROP_BOX_PUTTING_OBJECTS");


export const toggleProjectCreationModal = basicAction(TOGGLE_PROJECT_CREATION_MODAL);

export const beginProjectEditing = basicAction(PROJECT_EDITING.BEGIN);
export const endProjectEditing = basicAction(PROJECT_EDITING.END);


const fetchDropBoxTree = networkAction(() => (dispatch, getState) => ({
    types: FETCH_DROP_BOX_TREE,
    url: `${getState().services.dropBoxService.url}/tree`,
    err: "Error fetching drop box file tree",
}));

// TODO: If needed
export const fetchDropBoxTreeOrFail = () => async dispatch => {
    try {
        return await dispatch(fetchDropBoxTree());
    } catch (e) {
        // Reset loading
        console.error(e);
        return await dispatch({type: FETCH_DROP_BOX_TREE.FINISH});
    }
};

const dropBoxObjectPath = (getState, path) =>
    `${getState().services.dropBoxService.url}/objects/${path.replace(/^\//, "")}`;

export const putDropBoxObject = networkAction((path, file) => async (dispatch, getState) => ({
    types: PUT_DROP_BOX_OBJECT,
    url: dropBoxObjectPath(getState, path),
    req: {
        method: "PUT",
        body: await file.arrayBuffer(),
    },
    onSuccess: () => {
        message.success(`Successfully uploaded file to drop box path: ${path}`);
    },
    err: `Error uploading file to drop box path: ${path}`,
}));

export const beginDropBoxPuttingObjects = basicAction(DROP_BOX_PUTTING_OBJECTS.BEGIN);
export const endDropBoxPuttingObjects = basicAction(DROP_BOX_PUTTING_OBJECTS.END);

export const deleteDropBoxObject = networkAction(path => async (dispatch, getState) => ({
    types: DELETE_DROP_BOX_OBJECT,
    url: dropBoxObjectPath(getState, path),
    req: {method: "DELETE"},
    onSuccess: () => {
        message.success(`Successfully deleted file at drop box path: ${path}`);
        return dispatch(fetchDropBoxTreeOrFail());
    },
    err: `Error deleting file at drop box path: ${path}`,
}));
