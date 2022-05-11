import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";

import { Skeleton } from "antd";

import Run from "./Run";
import { withBasePath } from "../../../utils/url";
import { runPropTypesShape } from "../../../propTypes";

const RunDetailContent = ({ runsByID, match }) => {
    // TODO: 404
    const history = useHistory();

    const run = runsByID[match.params.id] || null;
    const loading = (run || { details: null }).details === null;
    return loading ? (
        <div
            style={{
                marginTop: "12px",
                marginLeft: "24px",
                marginRight: "24px",
            }}
        >
            <Skeleton />
        </div>
    ) : (
        <Run
            run={run}
            tab={match.params.tab}
            onChangeTab={(key) =>
                history.push(
                    withBasePath(`admin/data/manager/runs/${run.run_id}/${key}`)
                )
            }
            onBack={() => history.push(withBasePath("admin/data/manager/runs"))}
        />
    );
};

RunDetailContent.propTypes = {
    runsByID: PropTypes.objectOf(runPropTypesShape), // TODO: Shape (shared)
};

const mapStateToProps = (state) => ({
    runsByID: state.runs.itemsByID,
});

export default connect(mapStateToProps)(RunDetailContent);
