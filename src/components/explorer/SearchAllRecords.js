import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Dropdown, Empty, Icon, Menu, Modal, Tabs, Typography, Input} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/empty/style/css";
import "antd/es/icon/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
import "antd/es/tabs/style/css";
import "antd/es/typography/style/css";

const { Search } = Input;

import { searchAllRecordsPropTypesShape, individualPropTypesShape } from "../../propTypes";
import { fetchSearchAllRecordsIfNecessary } from "../../modules/metadata/actions";
import { searchAllRecords } from "../../modules/metadata/reducers";

class SearchAllRecords extends Component{

  constructor(props) {
      super(props);

      this.state = {
        searchLoading:false
      }

      this.onSearch = this.onSearch.bind(this);

  }

  async onSearch(text) {
    this.setState({
      searchLoading:true
    });

    await this.props.fetchSearchAllRecordsIfNecessary(this.props.datasetID, text);
    console.log(this.props.searchAllRecords.data.results);

    console.log(this.props.searchAllRecords.searchResultsByDatasetID);

    this.setState({
      searchLoading:this.props.searchAllRecords.isFetching
    });

  }

  render(){
    return <Card style={{marginBottom: "1.5em"}}>
        <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
            Search All Records
        </Typography.Title>
        <Search
          placeholder="Search"
          loading={this.state.searchLoading}
          onSearch={this.onSearch}
          style={{width: "40%"}}
          enterButton />
    </Card>;
  }
}

SearchAllRecords.propTypes = {
    searchAllRecords:PropTypes.shape({
        isFetching: PropTypes.bool,
        data: searchAllRecordsPropTypesShape
    }),
    fetchIndividualIfNecessary: PropTypes.func,
    individuals: PropTypes.objectOf(individualPropTypesShape)
};

const mapStateToProps = state => ({
    searchAllRecords: state.searchAllRecords
});

export default connect(mapStateToProps, {
   fetchSearchAllRecordsIfNecessary
})(SearchAllRecords);
