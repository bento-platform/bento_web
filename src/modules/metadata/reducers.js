import {objectWithoutProp} from "../../utils";

import {
    FETCH_PROJECTS,
    FETCH_PROJECT_TABLES,
    FETCHING_PROJECTS_WITH_TABLES,

    CREATE_PROJECT,
    DELETE_PROJECT,
    SAVE_PROJECT,

    ADD_PROJECT_DATASET,
    SAVE_PROJECT_DATASET,
    DELETE_PROJECT_DATASET,

    ADD_DATASET_LINKED_FIELD_SET,
    SAVE_DATASET_LINKED_FIELD_SET,
    DELETE_DATASET_LINKED_FIELD_SET,

    PROJECT_TABLE_ADDITION,
    PROJECT_TABLE_DELETION,

    FETCH_PHENOPACKETS,
    FETCH_BIOSAMPLES,
    FETCH_INDIVIDUALS,
} from "./actions";


const projectSort = (a, b) => a.title.localeCompare(b.title);


export const projects = (
    state = {
        isFetching: false,
        isFetchingWithTables: false,
        isCreating: false,
        isDeleting: false,
        isSaving: false,
        isAddingDataset: false,
        isSavingDataset: false,
        isDeletingDataset: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_PROJECTS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PROJECTS.RECEIVE:
            return {
                ...state,
                items: action.data.sort(projectSort),
                itemsByID: Object.fromEntries(action.data.map(p => [p.identifier, p])),
            };

        case FETCH_PROJECTS.FINISH:
            return {...state, isFetching: false};


        case FETCHING_PROJECTS_WITH_TABLES.BEGIN:
            return {...state, isFetchingWithTables: true};

        case FETCHING_PROJECTS_WITH_TABLES.END:
        case FETCHING_PROJECTS_WITH_TABLES.TERMINATE:
            return {...state, isFetchingWithTables: false};


        case CREATE_PROJECT.REQUEST:
            return {...state, isCreating: true};

        case CREATE_PROJECT.RECEIVE:
            return {
                ...state,
                items: [...state.items, action.data].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.identifier]: action.data
                }
            };

        case CREATE_PROJECT.FINISH:
            return {...state, isCreating: false};


        case DELETE_PROJECT.REQUEST:
            return {...state, isDeleting: true};

        case DELETE_PROJECT.RECEIVE:
            return {
                ...state,
                items: state.items.filter(p => p.identifier !== action.project.identifier),
                itemsByID: Object.fromEntries(Object.entries(objectWithoutProp(state.itemsByID,
                    action.project.identifier)).filter(([projectID, _]) => projectID !== action.project.identifier))
            };

        case DELETE_PROJECT.FINISH:
            return {...state, isDeleting: false};


        case SAVE_PROJECT.REQUEST:
            return {...state, isSaving: true};

        case SAVE_PROJECT.RECEIVE:
            return {
                ...state,
                items: [...state.items.filter(p => p.identifier !== action.data.identifier), action.data]
                    .sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.identifier]: action.data
                }
            };

        case SAVE_PROJECT.FINISH:
            return {...state, isSaving: false};


        case ADD_PROJECT_DATASET.REQUEST:
            return {...state, isAddingDataset: true};

        case ADD_PROJECT_DATASET.RECEIVE:
            return {
                ...state,
                isAddingDataset: false,
                items: state.items.map(p => p.identifier === action.data.project
                    ? {...p, datasets: [...p.datasets, action.data]}
                    : p
                ),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.project]: {
                        ...(state.itemsByID[action.data.project] || {}),
                        datasets: [...((state.itemsByID[action.data.project] || {}).datasets || []), action.data]
                    }
                }
            };


        case SAVE_PROJECT_DATASET.REQUEST:
        case ADD_DATASET_LINKED_FIELD_SET.REQUEST:
        case SAVE_DATASET_LINKED_FIELD_SET.REQUEST:
        case DELETE_DATASET_LINKED_FIELD_SET.REQUEST:
            return {...state, isSavingDataset: true};

        case SAVE_PROJECT_DATASET.RECEIVE:
        case ADD_DATASET_LINKED_FIELD_SET.RECEIVE:
        case SAVE_DATASET_LINKED_FIELD_SET.RECEIVE:
        case DELETE_DATASET_LINKED_FIELD_SET.RECEIVE:
            const replaceDataset = d => d.identifier === action.data.identifier ? {...d, ...action.data} : d;
            return {
                ...state,
                items: state.items.map(p => p.identifier === action.data.project
                    ? {...p, datasets: p.datasets.map(replaceDataset)}
                    : p
                ),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.project]: {
                        ...(state.itemsByID[action.data.project] || {}),
                        datasets: ((state.itemsByID[action.data.project] || {}).datasets || []).map(replaceDataset)
                    }
                }
            };

        case SAVE_PROJECT_DATASET.FINISH:
        case ADD_DATASET_LINKED_FIELD_SET.FINISH:
        case SAVE_DATASET_LINKED_FIELD_SET.FINISH:
        case DELETE_DATASET_LINKED_FIELD_SET.FINISH:
            return {...state, isSavingDataset: false};


        case DELETE_PROJECT_DATASET.REQUEST:
            return {...state, isDeletingDataset: true};

        case DELETE_PROJECT_DATASET.RECEIVE:
            const deleteDataset = d => d.identifier !== action.dataset.identifier;
            return {
                ...state,
                items: state.items.map(p => p.identifier === action.project.identifier
                    ? {...p, datasets: p.datasets.filter(deleteDataset)}
                    : p
                ),
                itemsByID: {
                    ...state.itemsByID,
                    [action.project.identifier]: {
                        ...(state.itemsByID[action.project.identifier] || {}),
                        datasets: ((state.itemsByID[action.project.identifier] || {}).datasets || [])
                            .filter(deleteDataset)
                    }
                }
            };

        case DELETE_PROJECT_DATASET.FINISH:
            return {...state, isDeletingDataset: false};


        default:
            return state;
    }
};


export const projectTables = (
    state = {
        isFetching: false,
        isFetchingAll: false,
        isAdding: false,
        isDeleting: false,
        items: [],
        itemsByProjectID: {}
    },
    action
) => {
    switch (action.type) {
        case CREATE_PROJECT.RECEIVE:
            // TODO: Might want to re-fetch upon project creation instead...
            return {
                ...state,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.data.id]: []
                }
            };

        case DELETE_PROJECT.RECEIVE:
            return {
                ...state,
                items: state.items.filter(t => t.project_id !== action.project.identifier),
                itemsByProjectID: objectWithoutProp(state.itemsByProjectID, action.project.identifier)
            };

        case FETCH_PROJECT_TABLES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PROJECT_TABLES.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [
                    ...state.items,
                    ...action.data
                        .map(t => ({
                            ...t,
                            project_id: (Object.entries(action.projectsByID)
                                .filter(([_, project]) => project.datasets.map(d => d.identifier)
                                    .includes(t.dataset))[0] || [])[0] || null
                        }))
                        .filter(t => t.project_id !== null && !state.items.map(t => t.table_id).includes(t.table_id))
                ],
                itemsByProjectID: {  // TODO: Improve performance by maybe returning project ID on server side?
                    ...state.itemsByProjectID,
                    ...Object.fromEntries(Object.entries(action.projectsByID).map(([projectID, project]) =>
                        [projectID, action.data.filter(t => project.datasets
                            .map(d => d.identifier)
                            .includes(t.dataset))]
                    ))
                }
            };

        case FETCH_PROJECT_TABLES.FINISH:
            return {...state, isFetching: false};

        case PROJECT_TABLE_ADDITION.BEGIN:
            return {...state, isAdding: true};

        case PROJECT_TABLE_ADDITION.END:
            // TODO
            return {
                ...state,
                isAdding: false,
                items: [...state.items, action.table],
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.project.identifier]: [...(state.itemsByProjectID[action.project.identifier] || []),
                        action.table]
                }
            };

        case PROJECT_TABLE_ADDITION.TERMINATE:
            return {...state, isAdding: false};

        case PROJECT_TABLE_DELETION.BEGIN:
            return {...state, isDeleting: true};

        case PROJECT_TABLE_DELETION.END:
            return {
                ...state,
                isDeleting: false,
                items: state.items.filter(t => t.table_id !== action.tableID),
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.project.identifier]: (state.itemsByProjectID[action.project.identifier] || [])
                        .filter(t => t.id !== action.tableID)
                }
            };

        case PROJECT_TABLE_DELETION.TERMINATE:
            return {...state, isDeleting: false};

        default:
            return state;
    }
};


export const phenopackets = (
    state = {
        isFetching: false,
        items: [],
        itemsByDatasetID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_PHENOPACKETS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PHENOPACKETS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [...action.data],
                itemsByDatasetID: Object.fromEntries(Object.entries(action))  // TODO: ????????
            };

        case FETCH_PHENOPACKETS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const biosamples = (
    state = {
        isFetching: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_BIOSAMPLES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_BIOSAMPLES.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [...action.data],
                itemsByID: Object.fromEntries(action.data.map(b => [b.id, b]))
            };

        case FETCH_BIOSAMPLES.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const individuals = (
    state = {
        isFetching: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_INDIVIDUALS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_INDIVIDUALS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [...action.data],
                itemsByID: Object.fromEntries(action.data.map(i => [i.id, i]))
            };

        case FETCH_INDIVIDUALS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
