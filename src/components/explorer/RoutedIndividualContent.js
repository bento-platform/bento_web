import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import { Table } from "antd";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";

export const RoutedIndividualContentTable = ({data, urlParam, columns, rowKey, handleRowSelect, expandedRowRender}) => {
    const paramValue = useParams()[urlParam];
    const selectedRowKeys = useMemo(() => paramValue ? [paramValue] : [], [paramValue]);
    const onExpand = useCallback(
        (e, record) => handleRowSelect(e ? record[rowKey] : undefined),
        [handleRowSelect, rowKey],
    );
    return (
        <Table
            bordered={true}
            pagination={false}
            size="middle"
            columns={columns}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={expandedRowRender}
            dataSource={data}
            rowKey={rowKey}
        />
    );
};
RoutedIndividualContentTable.propTypes = {
    data: PropTypes.array,
    urlParam: PropTypes.string,
    columns: PropTypes.array,
    rowKey: PropTypes.string,
    handleRowSelect: PropTypes.func,
    expandedRowRender: PropTypes.func,
};

export const RoutedIndividualContent = ({data, renderContent, urlParam}) => {
    const history = useHistory();
    const match = useRouteMatch();

    const handleRoutedSelection = useCallback((selected) => {
        if (!selected) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${selected}`);
    });

    const contentNode = useMemo(() => renderContent({
        "data": data,
        "onContentSelect": handleRoutedSelection,
    }), [data, handleRoutedSelection]);

    return (
        <Switch>
            <Route path={`${match.path}/:${urlParam}`}>{contentNode}</Route>
            <Route path={match.path}>{contentNode}</Route>
        </Switch>
    );
};
RoutedIndividualContent.propTypes = {
    data: PropTypes.array,
    renderContent: PropTypes.func,
    urlParam: PropTypes.string,
};
