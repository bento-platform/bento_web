import {
  FETCH_DROP_BOX_TREE,
  PUT_DROP_BOX_OBJECT,
  DROP_BOX_PUTTING_OBJECTS,
  DELETE_DROP_BOX_OBJECT,
  INVALIDATE_DROP_BOX_TREE,
} from "./actions";

export const dropBox = (
  state = {
    isFetching: false,
    isPutting: false,
    isPuttingFlow: false,
    isDeleting: false,
    isInvalid: false,
    hasAttempted: false,
    tree: [],
  },
  action,
) => {
  switch (action.type) {
    case FETCH_DROP_BOX_TREE.REQUEST:
      return { ...state, isFetching: true };
    case FETCH_DROP_BOX_TREE.RECEIVE:
      return { ...state, tree: action.data };
    case FETCH_DROP_BOX_TREE.FINISH:
      return { ...state, isFetching: false, hasAttempted: true, isInvalid: false };

    case INVALIDATE_DROP_BOX_TREE:
      return { ...state, isInvalid: true };

    case PUT_DROP_BOX_OBJECT.REQUEST:
      return { ...state, isPutting: true };
    case PUT_DROP_BOX_OBJECT.FINISH:
      return { ...state, isPutting: false };

    case DROP_BOX_PUTTING_OBJECTS.BEGIN:
      return { ...state, isPuttingFlow: true };
    case DROP_BOX_PUTTING_OBJECTS.END:
    case DROP_BOX_PUTTING_OBJECTS.TERMINATE:
      return { ...state, isPuttingFlow: false };

    case DELETE_DROP_BOX_OBJECT.REQUEST:
      return { ...state, isDeleting: true };
    case DELETE_DROP_BOX_OBJECT.FINISH:
      return { ...state, isDeleting: false };

    default:
      return state;
  }
};
