import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import { Skeleton } from "antd";

import Run from "./Run";

const styles = {
    skeletonContainer: {
        marginTop: "12px",
        marginLeft: "24px",
        marginRight: "24px",
    },
};

const RunDetailContent = () => {
    const history = useHistory();
    const { id, tab } = useParams();

    const runsByID = useSelector((state) => state.runs.itemsByID);

    // TODO: 404
    const run = runsByID[id] || null;
    const loading = (run || {details: null}).details === null;

    const onChangeTab = useCallback(
        (key) => history.push(`/admin/data/manager/runs/${run.run_id}/${key}`),
        [history, run]);
    const onBack = useCallback(() => history.push("/admin/data/manager/runs"), [history]);

    return loading
        ? <div style={styles.skeletonContainer}><Skeleton /></div>
        : <Run run={run} tab={tab} onChangeTab={onChangeTab} onBack={onBack} />;
};

export default RunDetailContent;
