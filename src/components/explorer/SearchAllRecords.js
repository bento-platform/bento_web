import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card, Typography, Input } from "antd";

const { Search } = Input;
import { performFreeTextSearchIfPossible } from "../../modules/explorer/actions";

class SearchAllRecords extends Component {
    constructor(props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
    }

    async onSearch(searchTerm) {
        await this.props.performFreeTextSearchIfPossible(this.props.datasetID, searchTerm);
    }

    render() {
        return (
      <Card style={{ marginBottom: "1.5em" }}>
        <Typography.Title level={3} style={{ marginBottom: "1.5rem" }}>
          Text Search
        </Typography.Title>
        <Search
          placeholder="Search"
          onSearch={this.onSearch}
          style={{ width: "40%" }}
          loading={this.props.isFetchingTextSearch}
          disabled={this.props.isFetchingAdvancedSearch}
          enterButton />
      </Card>
        );
    }
}

SearchAllRecords.propTypes = {
    datasetID: PropTypes.string,
    performFreeTextSearchIfPossible: PropTypes.func,
    searchAllRecords: PropTypes.object,
    isFetchingAdvancedSearch: PropTypes.bool,
    isFetchingTextSearch: PropTypes.bool,
};

const mapStateToProps = (state, ownProps) => ({
    isFetchingAdvancedSearch: state.explorer.fetchingSearchByDatasetID[ownProps.datasetID] ?? false,
    isFetchingTextSearch: state.explorer.fetchingTextSearch ?? false,
});

export default connect(mapStateToProps, {
    performFreeTextSearchIfPossible,
})(SearchAllRecords);
