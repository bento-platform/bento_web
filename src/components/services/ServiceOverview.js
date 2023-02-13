import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Col, Layout, Row, Skeleton, Typography} from "antd";

import ReactJson from "react-json-view";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ServiceOverview extends Component {
    render() {
        const kind = this.props.match.params.kind;
        const serviceInfo = this.props.serviceInfoByKind[kind] || null;
        const bentoServiceInfo = this.props.bentoServicesByKind[kind] || null;
        const loading = !(serviceInfo && bentoServiceInfo);

        return loading ? <Skeleton /> : <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Row>
                    <Col span={12}>
                        <Typography.Title level={4}>Service Info</Typography.Title>
                        <ReactJson
                            src={serviceInfo ?? {}}
                            displayDataTypes={false}
                            enableClipboard={false}
                            name={null}
                        />
                    </Col>
                    <Col span={12}>
                        <Typography.Title level={4}>Bento Service Configuration</Typography.Title>
                        <ReactJson
                            src={bentoServiceInfo ?? {}}
                            displayDataTypes={false}
                            enableClipboard={false}
                            name={null}
                        />
                    </Col>
                </Row>
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
