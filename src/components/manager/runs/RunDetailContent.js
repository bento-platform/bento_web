import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
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

const RunDetailContentInner = () => {
    const navigate = useNavigate();
    const { id, tab } = useParams();

    const runsByID = useSelector((state) => state.runs.itemsByID);

    // TODO: 404
    const run = runsByID[id] || null;
    const loading = (run?.details ?? null) === null;

    const onChangeTab = useCallback(
        (key) => navigate(`../${key}`),
        [navigate, run]);
    const onBack = useCallback(() => navigate("/data/manager/runs"), [navigate]);

    return loading
        ? <div style={styles.skeletonContainer}><Skeleton /></div>
        : <Run run={run} tab={tab} onChangeTab={onChangeTab} onBack={onBack} />;
};

const RunDetailContent = () => (
    <Routes>
        <Route path=":tab" element={<RunDetailContentInner />} />
        <Route path="/" element={<Navigate to="request" replace={true} />} />
    </Routes>
);

export default RunDetailContent;
