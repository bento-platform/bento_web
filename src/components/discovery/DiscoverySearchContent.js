import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Typography} from "antd";

import SearchList from "./SearchList";

import {
    performFullSearchIfPossible,

    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,

    // updateJoinQueryForm,
} from "../../modules/discovery/actions";
import DiscoveryQueryBuilder from "./DiscoveryQueryBuilder";


class DiscoverySearchContent extends Component {
    render() {
        return <>
            <DiscoveryQueryBuilder isInternal={false}
                                   dataTypeForms={this.props.dataTypeForms}
                                   addDataTypeQueryForm={this.props.addDataTypeQueryForm}
                                   updateDataTypeQueryForm={this.props.updateDataTypeQueryForm}
                                   removeDataTypeQueryForm={this.props.removeDataTypeQueryForm}
                                   searchLoading={this.props.searchLoading}
                                   onSubmit={this.props.performFullSearchIfPossible} />
            <Typography.Title level={3}>Results</Typography.Title>
            <SearchList />
        </>;
    }
}

DiscoverySearchContent.propTypes = {
    searchLoading: PropTypes.bool,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    // joinFormValues: PropTypes.object,

    performFullSearchIfPossible: PropTypes.func,

    addDataTypeQueryForm: PropTypes.func,
    updateDataTypeQueryForm: PropTypes.func,
    removeDataTypeQueryForm: PropTypes.func,

    // updateJoinForm: PropTypes.func,
};

const mapStateToProps = state => ({
    searchLoading: state.discovery.isFetching,
    dataTypeForms: state.discovery.dataTypeForms,
    // joinFormValues: state.discovery.joinFormValues,
});

export default connect(mapStateToProps, {
    performFullSearchIfPossible,

    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,

    // updateJoinForm,
})(DiscoverySearchContent);
