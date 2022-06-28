import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card, Typography, Input } from "antd";

const { Search } = Input;
import { performFreeTextSearchIfPossible } from "../../modules/explorer/actions";

const SearchAllRecords = ({
    datasetID,
    performFreeTextSearchIfPossible,
    searchAllRecords,
}) => {
    const onSearch = async (searchTerm) => {
        await performFreeTextSearchIfPossible(datasetID, searchTerm);
    };

    const isFetching = searchAllRecords.fetchingSearchByDatasetID[datasetID];
    return (
        <Card style={{ marginBottom: "1.5em" }}>
            <Typography.Title level={3} style={{ marginBottom: "1.5rem" }}>
                Text Search
            </Typography.Title>
            <Search
                placeholder="Search"
                onSearch={onSearch}
                style={{ width: "40%" }}
                loading={isFetching}
                enterButton
            />
        </Card>
    );
};

SearchAllRecords.propTypes = {
    datasetID: PropTypes.string,
    performFreeTextSearchIfPossible: PropTypes.func,
    searchAllRecords: PropTypes.object,
};

const mapStateToProps = (state) => ({
    searchAllRecords: state.explorer,
});

export default connect(mapStateToProps, {
    performFreeTextSearchIfPossible,
})(SearchAllRecords);
