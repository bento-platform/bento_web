import { FETCHING_USER_DEPENDENT_DATA } from "./actions";

export const user = (
    state = {
        isFetchingUserDependentData: false,
    },
    action
) => {
    switch (action.type) {
        // FETCHING_USER_DEPENDENT_DATA
        case FETCHING_USER_DEPENDENT_DATA.BEGIN:
            return { ...state, isFetchingDependentData: true };
        case FETCHING_USER_DEPENDENT_DATA.END:
        case FETCHING_USER_DEPENDENT_DATA.TERMINATE:
            return { ...state, isFetchingDependentData: false, hasAttempted: true };
        default:
            return state;
    }
};
