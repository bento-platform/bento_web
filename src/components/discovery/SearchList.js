import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Col, Collapse, Empty, Icon, Modal, Popover, Row, Spin, Table, Typography} from "antd";

import DataUseDisplay from "../DataUseDisplay";
import {selectSearch} from "../../modules/discovery/actions";
import {nodeInfoDataPropTypesShape} from "../../propTypes";


class SearchList extends Component {
    constructor(props) {
        super(props);

        // TODO: Redux?
        this.state = {
            dataUseTermsModalShown: false,
            dataset: null
        };

        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.handleDatasetTermsClick = this.handleDatasetTermsClick.bind(this);
        this.handleDatasetTermsCancel = this.handleDatasetTermsCancel.bind(this);

        this.searchResultColumns = [
            {
                title: "Node",
                dataIndex: "node",
                width: 75,
                render: node => (
                    /* TODO: Don't show icon if the current node is just for exploration (vFuture) */
                    <Popover content={<>
                        <a href={node} target="_blank" rel="noreferrer noopener">{node}</a>
                        {this.props.nodeInfo.CHORD_URL === node
                            ? <span style={{marginLeft: "0.5em"}}>(current node)</span> : null}
                    </>}>
                        <div style={{width: "100%", textAlign: "center"}}>
                            <Icon type={this.props.nodeInfo.CHORD_URL === node ? "home" : "global"} />
                        </div>
                    </Popover>
                )
            },
            {
                title: "Dataset ID",
                dataIndex: "identifier",
                sorter: (a, b) => a.identifier.localeCompare(b.identifier),
                render: (_, dataset) => (
                    <a target="_blank"
                       rel="noreferrer noopener"
                       href={`${dataset.node}data/sets/${dataset.identifier}`}
                       style={{fontFamily: "monospace"}}>{dataset.identifier}</a>
                ),
            },
            {
                title: "Title",
                dataIndex: "title",
                sorter: (a, b) => a.title.localeCompare(b.title),
                defaultSortOrder: "ascend",
            },
            {
                title: "Contact Information",
                dataIndex: "contact_info",
                render: contactInfo => (contactInfo || "").split("\n")
                    .map((p, i) => <Fragment key={i}>{p}<br /></Fragment>)
            },
            {
                title: "Actions",
                dataIndex: "actions",
                render: (_, dataset) => (
                    <Row type="flex">
                        <Col>
                            <Button type="link" onClick={() => this.handleDatasetTermsClick(dataset)}>
                                Data Use &amp; Consent
                            </Button>
                        </Col>
                        {/* TODO: Implement manage button v0.2 */}
                        {/*{dataset.node === nodeURL && this.props.user.chord_user_role === "owner" ? (*/}
                        {/*    <Col>*/}
                        {/*        <Button type="link" onClick={() => {}}>*/}
                        {/*            Manage*/}
                        {/*        </Button>*/}
                        {/*    </Col>*/}
                        {/*) : null}*/}
                        {/*<Col>*/}
                        {/*    <Button type="link">/!*
                                            TODO: Real actions *!/Request Access</Button>*/}
                        {/*</Col>*/}
                    </Row>
                ),
            },
        ];
    }

    handleSearchSelect(searchIndex) {
        this.props.selectSearch(searchIndex === null ? null : parseInt(searchIndex, 10));
    }

    handleDatasetTermsClick(dataset) {
        this.setState({
            dataUseTermsModalShown: true,
            dataset
        });
    }

    handleDatasetTermsCancel() {
        this.setState({dataUseTermsModalShown: false});
    }

    render() {
        if (!this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        const datasetNameOrID = (this.state.dataset || {}).name || (this.state.dataset || {}).id || "";
        const dataUseTermsTitle = `Dataset ${datasetNameOrID
            .substr(0, 18)}${datasetNameOrID ? "…" : ""}: Data Use Terms`;

        return <>
            <Modal title={dataUseTermsTitle}
                   visible={this.state.dataUseTermsModalShown}
                   onCancel={() => this.handleDatasetTermsCancel()}
                   footer={null}>
                <DataUseDisplay dataUse={(this.state.dataset || {}).data_use} />
            </Modal>
            <Spin spinning={this.props.searchLoading}>
                <Collapse bordered={true}
                          accordion={true}
                          activeKey={(this.props.selectedSearch || 0).toString(10)}
                          onChange={i => this.handleSearchSelect(i)}>
                    {[...this.props.searches].reverse().map((s, i) => {
                        const searchResults = Object.entries(s.results).flatMap(([n, r]) =>
                            r ? r.map(d => ({...d, node: n})) : []);  // TODO: Report node response errors
                        const title = `Search ${this.props.searches.length - i}: ${searchResults.length} result${
                            searchResults.length === 1 ? "" : "s"}`;
                        return (
                            <Collapse.Panel header={title}
                                            key={(this.props.searches.length - i - 1).toString(10)}>
                                <Typography.Title level={4}>
                                    Nodes Responded:&nbsp;
                                    <span style={{fontWeight: "normal"}}>
                                        {Object.values(s.results).filter(r => r !== null).length}
                                        &nbsp;/&nbsp;
                                        {Object.keys(s.results).length}</span>
                                </Typography.Title>
                                <Typography.Title level={4}>Results</Typography.Title>
                                <Table bordered={true}
                                       columns={this.searchResultColumns}
                                       dataSource={searchResults}
                                       rowKey="identifier" />
                            </Collapse.Panel>
                        );
                    })}
                </Collapse>
            </Spin>
        </>;
    }
}

SearchList.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    user: PropTypes.object,  // TODO: Shape
    searches: PropTypes.array,  // TODO: Shape
    selectedSearch: PropTypes.number,
    searchLoading: PropTypes.bool,

    selectSearch: PropTypes.func,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    user: state.auth.user,

    searches: state.discovery.searches,
    selectedSearch: state.discovery.selectedSearch,

    searchLoading: state.discovery.isFetching,
});

export default connect(mapStateToProps, {selectSearch})(SearchList);
