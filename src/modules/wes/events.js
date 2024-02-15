import {fetchRunLogs, receiveRunDetails} from "./actions";

const EVENT_WES_RUN_UPDATED = "wes_run_updated";

export default {
    [/^bento\.service\.wes$/.source]: (message) => async (dispatch) => {
        if (message.type === EVENT_WES_RUN_UPDATED) {
            const { data: runDetails, timestamp } = message;
            dispatch(receiveRunDetails(runDetails.run_id, runDetails, timestamp));
            if (runDetails.run_log.exit_code !== null) {
                // Event just finished, trigger a stdout/stderr update
                await dispatch(fetchRunLogs(runDetails.run_id));
            }
        }
    },
};
