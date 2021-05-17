import React, {Component, createRef} from "react";
import {connect} from "react-redux";
import fetch from "cross-fetch";

import {Skeleton} from "antd";

import {serviceLogsPropTypesShape} from "../../propTypes";

class ServiceLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: ""
        };
        this.getLogUrl = this.getLogUrl.bind(this);
        this.fetchLog = this.fetchLog.bind(this);
        this.containerDiv = createRef();
    }

    getLogUrl(artifact, logName) {
        return ((this.props.serviceLogs.itemsByArtifact[artifact] || {}).logs || {})[logName];
    }

    componentDidMount() {
        const artifact = this.props.match.params.artifact;
        const logName = this.props.match.params.log;

        if (!artifact || !logName) return;

        this.fetchLog(this.getLogUrl(artifact, logName)).catch(console.error);
    }

    componentDidUpdate(prevProps, _prevState, _snapshot) {
        const oldArtifact = prevProps.match.params.artifact;
        const oldLogName = prevProps.match.params.log;
        const artifact = this.props.match.params.artifact;
        const logName = this.props.match.params.log;

        if ((oldArtifact !== artifact || oldLogName !== logName) && artifact && logName) {
            this.fetchLog(this.getLogUrl(artifact, logName)).catch(console.error);
        }
    }

    async fetchLog(path) {
        this.setState({loading: true});
        const r = await fetch(path);
        if (r.ok) {
            const data = await r.text();
            this.setState({data, loading: false}, () => {
                const div = this.containerDiv.current;
                div.scrollTop = div.scrollHeight;
            });
        } else {
            throw r;
        }
    }

    render() {
        const div = this.containerDiv.current;
        return <div style={{
            maxHeight: "calc(100vh - 48px)",
            overflow: "auto",
            boxSizing: "border-box",
            padding: "24px",
            transition: "box-shadow 0.1s ease-in-out",
            ...(this.state.data.split("\n").length > 40 || (div && div.scrollTop > 0)
                ? {boxShadow: "inset 0 2px 3px rgba(0, 0, 0, 0.05)"}
                : {boxShadow: "inset 0 2px 3px rgba(0, 0, 0, 0.0)"})
        }} ref={this.containerDiv}>
            {this.state.loading
                ? <Skeleton active={true} title={false} />
                : <pre style={{fontSize: "11px"}}>{this.state.data.trim()}</pre>}
        </div>;
    }
}

const mapStateToProps = state => ({
    serviceLogs: state.logs.service,
    loadingAuthDependentData: state.auth.isFetchingDependentData,
});

ServiceLog.propTypes = {
    serviceLogs: serviceLogsPropTypesShape,
};

export default connect(mapStateToProps)(ServiceLog);
