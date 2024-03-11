import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch, useHistory, useParams } from "react-router-dom";
import PropTypes from "prop-types";

import { Skeleton } from "antd";

import Run from "./Run";

const styles = {
    skeletonContainer: {
        marginTop: "12px",
        marginLeft: "24px",
        marginRight: "24px",
    },
};

const RunDetailContentInner = ({ id }) => {
    const history = useHistory();
    const { tab } = useParams();

    const runsByID = useSelector((state) => state.runs.itemsByID);

    // TODO: 404
    const run = runsByID[id] || null;
    const loading = (run?.details ?? null) === null;

    const onChangeTab = useCallback(
        (key) => history.push(`/admin/data/manager/runs/${run?.run_id}/${key}`),
        [history, run]);
    const onBack = useCallback(() => history.push("/admin/data/manager/runs"), [history]);

    return loading
        ? <div style={styles.skeletonContainer}><Skeleton /></div>
        : <Run run={run} tab={tab} onChangeTab={onChangeTab} onBack={onBack} />;
};
RunDetailContentInner.propTypes = {
    id: PropTypes.string,
};

const RunDetailContent = () => {
    const { id } = useParams();
    return (
        <Switch>
            <Route path={`/admin/data/manager/runs/${id}/:tab`}><RunDetailContentInner id={id} /></Route>
            <Route path={`/admin/data/manager/runs/${id}`}
                   render={() => <Redirect to={`/admin/data/manager/runs/${id}/request`} />} />
        </Switch>
    );
};

export default RunDetailContent;
