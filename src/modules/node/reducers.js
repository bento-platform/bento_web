import {FETCH_NODE_INFO} from "./actions";

export const nodeInfo = (
    state = {
        isFetching: false,
        data: {},
    },
    {type, data},
) => {
    switch (type) {
        case FETCH_NODE_INFO.REQUEST:
            return {...state, isFetching: true};
        case FETCH_NODE_INFO.RECEIVE:
            return {...state, data};
        case FETCH_NODE_INFO.FINISH:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
