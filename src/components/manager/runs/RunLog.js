import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Descriptions, Skeleton} from "antd";


import {fetchRunLogStreamsIfPossibleAndNeeded} from "../../../modules/wes/actions";
import {runPropTypesShape} from "../../../propTypes";

class RunLog extends Component {
    componentDidMount() {
        if (!this.props.isFetchingRuns) {
            this.props.fetchRunLogStreamsIfPossibleAndNeeded(this.props.run.run_id);
        }
    }

    // noinspection JSCheckFunctionSignatures
    componentDidUpdate(prevProps) {
        if (prevProps.isFetchingRuns && !this.props.isFetchingRuns) {
            this.props.fetchRunLogStreamsIfPossibleAndNeeded(this.props.run.run_id);
        }
    }

    render() {
        const run = this.props.run || {};
        const details = run.details || {};
        const stdout = (this.props.runLogStreams[run.run_id] || {}).stdout || null;
        const stderr = (this.props.runLogStreams[run.run_id] || {}).stderr || null;
        return <Descriptions bordered style={{overflow: "auto"}}>
            <Descriptions.Item label="Command" span={3}>
                <span style={{fontFamily: "monospace", fontSize: "12px"}}>{details.run_log.cmd}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Name" span={2}>
                {details.run_log.name}
            </Descriptions.Item>
            <Descriptions.Item label="Exit Code" span={1}>
                {details.run_log.exit_code === null ? "N/A" : details.run_log.exit_code}
            </Descriptions.Item>
            <Descriptions.Item label={<span style={{fontFamily: "monospace"}}>stdout</span>} span={3}>
                {stdout !== null ? <pre style={{fontSize: "12px", whiteSpace: "break-spaces"}}>{
                    (stdout.data || "")}</pre> : <Skeleton paragraph={false} />}
            </Descriptions.Item>
            <Descriptions.Item label={<span style={{fontFamily: "monospace"}}>stderr</span>} span={3}>
                {stderr !== null ? <pre style={{fontSize: "12px", whiteSpace: "break-spaces"}}>{
                    (stderr.data || "")}</pre> : <Skeleton paragraph={false} />}
            </Descriptions.Item>
        </Descriptions>;
    }
}

RunLog.propTypes = {
    run: runPropTypesShape,

    isFetchingRuns: PropTypes.bool,
    runLogStreams: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
        isFetching: PropTypes.bool,
        data: PropTypes.string,
    }))),

    fetchRunLogStreamsIfPossibleAndNeeded: PropTypes.func,
};

const mapStateToProps = state => ({
    isFetchingRuns: state.runs.isFetching,
    runLogStreams: state.runs.streamsByID,
});

export default connect(mapStateToProps, {
    fetchRunLogStreamsIfPossibleAndNeeded,
})(RunLog);
