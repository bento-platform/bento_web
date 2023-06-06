import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Skeleton} from "antd";

import Run from "./Run";
import {runPropTypesShape} from "../../../propTypes";

class RunDetailContent extends Component {
    render() {
        // TODO: 404
        const run = this.props.runsByID[this.props.match.params.id] || null;
        const loading = (run || {details: null}).details === null;
        return loading
            ? <div style={{marginTop: "12px", marginLeft: "24px", marginRight: "24px"}}><Skeleton /></div>
            : <Run run={run}
                   tab={this.props.match.params.tab}
                   onChangeTab={key =>
                       this.props.history.push(`/admin/data/manager/runs/${run.run_id}/${key}`)}
                   onBack={() => this.props.history.push("/admin/data/manager/runs")} />;
    }
}

RunDetailContent.propTypes = {
    runsByID: PropTypes.objectOf(runPropTypesShape),  // TODO: Shape (shared)
};

const mapStateToProps = state => ({
    runsByID: state.runs.itemsByID,
});

export default connect(mapStateToProps)(RunDetailContent);
