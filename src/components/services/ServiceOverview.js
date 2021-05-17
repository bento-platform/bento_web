import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Skeleton, Typography} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ServiceOverview extends Component {
    render() {
        const artifact = this.props.match.params.artifact;
        const serviceInfo = this.props.serviceInfoByArtifact[artifact] || null;
        const bentoServiceInfo = this.props.bentoServicesByArtifact[artifact] || null;
        const loading = !(serviceInfo && bentoServiceInfo);

        return loading ? <Skeleton /> : <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={4}>Service Info</Typography.Title>
                <pre>{JSON.stringify(serviceInfo, null, 2)}</pre>
                <Typography.Title level={4}>Bento Service Configuration</Typography.Title>
                <pre>{JSON.stringify(bentoServiceInfo, null, 2)}</pre>
            </Layout.Content>
        </Layout>;
    }
}

ServiceOverview.propTypes = {
    serviceInfoByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
    bentoServicesByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact,
    bentoServicesByArtifact: state.chordServices.itemsByArtifact,
});

export default connect(mapStateToProps)(ServiceOverview);
