import React, { useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Col, Layout, Row, Spin, Statistic, Typography } from "antd";

import SitePageHeader from "./SitePageHeader";
import ServiceList from "./ServiceList";

import { SITE_NAME } from "../constants";
import {
    nodeInfoDataPropTypesShape,
    projectPropTypesShape,
} from "../propTypes";
import { EM_DASH } from "../constants";

const ServiceContent = ({
    nodeInfo,
    isFetchingNodeInfo,
    projects,
    isFetchingProjects,
    peers,
    isFetchingPeers,
}) => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Dashboard`;
    });

    return (
        <>
            <SitePageHeader
                title="Services"
                subTitle="Node status and health monitor"
            />
            <Layout>
                <Layout.Content
                    style={{
                        background: "white",
                        padding: "32px 24px 4px",
                    }}
                >
                    <Row style={{ marginBottom: "24px" }} gutter={[0, 16]}>
                        <Col lg={24} xl={12}>
                            <Spin spinning={isFetchingNodeInfo}>
                                <Statistic
                                    title="Node URL"
                                    value={
                                        isFetchingNodeInfo
                                            ? EM_DASH
                                            : nodeInfo.CHORD_URL
                                    }
                                />
                            </Spin>
                        </Col>
                        <Col md={12} lg={8} xl={3}>
                            <Spin spinning={isFetchingProjects}>
                                <Statistic
                                    title="Projects"
                                    value={
                                        isFetchingProjects
                                            ? EM_DASH
                                            : projects.length
                                    }
                                />
                            </Spin>
                        </Col>
                        <Col md={12} lg={8} xl={3}>
                            <Spin spinning={isFetchingProjects}>
                                <Statistic
                                    title="Datasets"
                                    value={
                                        isFetchingProjects
                                            ? EM_DASH
                                            : projects.flatMap(
                                                (p) => p.datasets
                                            ).length
                                    }
                                />
                            </Spin>
                        </Col>
                        {/* TODO: Tables */}
                        <Col md={12} lg={8} xl={3}>
                            <Spin spinning={isFetchingPeers}>
                                {/* Exclude self */}
                                <Statistic
                                    title="Network Size"
                                    value={
                                        isFetchingPeers ? EM_DASH : peers.length
                                    }
                                />
                            </Spin>
                        </Col>
                    </Row>
                    <Typography.Title level={3}>Services</Typography.Title>
                    <ServiceList />
                </Layout.Content>
            </Layout>
        </>
    );
};

ServiceContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    isFetchingNodeInfo: PropTypes.bool,

    projects: PropTypes.arrayOf(projectPropTypesShape),
    isFetchingProjects: PropTypes.bool,

    peers: PropTypes.arrayOf(PropTypes.string),
    isFetchingPeers: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,

    projects: state.projects.items,
    isFetchingProjects:
        state.auth.isFetchingDependentData || state.projects.isFetching,

    peers: state.peers.items,
    isFetchingPeers: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(ServiceContent);

// import React, {Component} from "react";
// import {connect} from "react-redux";
// import PropTypes from "prop-types";

// import {Col, Layout, Row, Spin, Statistic, Typography} from "antd";

// import SitePageHeader from "./SitePageHeader";
// import ServiceList from "./ServiceList";

// import {SITE_NAME} from "../constants";
// import {nodeInfoDataPropTypesShape, projectPropTypesShape} from "../propTypes";
// import {EM_DASH} from "../constants";

// class ServiceContent extends Component {
//     componentDidMount() {
//         document.title = `${SITE_NAME} - Dashboard`;
//     }

//     render() {
//         return <>
//             <SitePageHeader title="Services" subTitle="Node status and health monitor" />
//             <Layout>
//                 <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
//                     <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
//                         <Col lg={24} xl={12}>
//                             <Spin spinning={this.props.isFetchingNodeInfo}>
//                                 <Statistic title="Node URL"
//                                            value={this.props.isFetchingNodeInfo
//                                                ? EM_DASH
//                                                : this.props.nodeInfo.CHORD_URL} />
//                             </Spin>
//                         </Col>
//                         <Col md={12} lg={8} xl={3}>
//                             <Spin spinning={this.props.isFetchingProjects}>
//                                 <Statistic title="Projects"
//                                            value={this.props.isFetchingProjects
//                                                ? EM_DASH
//                                                : this.props.projects.length} />
//                             </Spin>
//                         </Col>
//                         <Col md={12} lg={8} xl={3}>
//                             <Spin spinning={this.props.isFetchingProjects}>
//                                 <Statistic title="Datasets"
//                                            value={this.props.isFetchingProjects
//                                                ? EM_DASH
//                                                : this.props.projects.flatMap(p => p.datasets).length} />
//                             </Spin>
//                         </Col>
//                         {/* TODO: Tables */}
//                         <Col md={12} lg={8} xl={3}>
//                             <Spin spinning={this.props.isFetchingPeers}>
//                                 {/* Exclude self */}
//                                 <Statistic title="Network Size"
//                                            value={this.props.isFetchingPeers
//                                                ? EM_DASH
//                                                : this.props.peers.length} />
//                             </Spin>
//                         </Col>
//                     </Row>
//                     <Typography.Title level={3}>Services</Typography.Title>
//                     <ServiceList />
//                 </Layout.Content>
//             </Layout>
//         </>;
//     }
// }

// ServiceContent.propTypes = {
//     nodeInfo: nodeInfoDataPropTypesShape,
//     isFetchingNodeInfo: PropTypes.bool,

//     projects: PropTypes.arrayOf(projectPropTypesShape),
//     isFetchingProjects: PropTypes.bool,

//     peers: PropTypes.arrayOf(PropTypes.string),
//     isFetchingPeers: PropTypes.bool,
// };

// const mapStateToProps = state => ({
//     nodeInfo: state.nodeInfo.data,
//     isFetchingNodeInfo: state.nodeInfo.isFetching,

//     projects: state.projects.items,
//     isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,

//     peers: state.peers.items,
//     isFetchingPeers: state.auth.isFetchingDependentData,
// });

// export default connect(mapStateToProps)(ServiceContent);
