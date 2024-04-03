import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";

// For spreadsheets, we generate synthetic keys based on row indices
export const SPREADSHEET_ROW_KEY_PROP = "__key__";

const TABLE_PAGINATION = { pageSize: 25 };
const TABLE_SCROLL = { x: true };

const SpreadsheetTable = ({ columns, dataSource, loading, showHeader }) => (
    <Table
        size="small"
        bordered={true}
        showHeader={showHeader ?? false}
        pagination={TABLE_PAGINATION}
        scroll={TABLE_SCROLL}
        rowKey={SPREADSHEET_ROW_KEY_PROP}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
    />
);
SpreadsheetTable.propTypes = {
    columns: PropTypes.array.isRequired,
    dataSource: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    showHeader: PropTypes.bool,
};

export default SpreadsheetTable;
