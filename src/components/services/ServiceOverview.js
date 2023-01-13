import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Skeleton, Typography} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ServiceOverview extends Component {
    render() {
        const kind = this.props.match.params.kind;
        const serviceInfo = this.props.serviceInfoByKind[kind] || null;
        const bentoServiceInfo = this.props.bentoServicesByKind[kind] || null;
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
    serviceInfoByKind: PropTypes.objectOf(PropTypes.object),  // TODO
    bentoServicesByKind: PropTypes.objectOf(PropTypes.object),  // TODO
};

const mapStateToProps = state => ({
    serviceInfoByKind: state.services.itemsByKind,
    bentoServicesByKind: state.chordServices.itemsByKind,
});

export default connect(mapStateToProps)(ServiceOverview);
