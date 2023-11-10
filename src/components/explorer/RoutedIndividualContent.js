import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import { Table } from "antd";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";
import { individualPropTypesShape } from "../../propTypes";
import {  useIndividualResources } from "./utils";

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
            size="small"
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

export const RoutedIndividualContent = ({individual, data, renderContent, urlParam}) => {
    const history = useHistory();
    const match = useRouteMatch();

    const resourcesTuple = useIndividualResources(individual);

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
        "resourcesTuple": resourcesTuple,
    }), [data, handleRoutedSelection, resourcesTuple]);

    return (
        <Switch>
            <Route path={`${match.path}/:${urlParam}`}>{contentNode}</Route>
            <Route path={match.path}>{contentNode}</Route>
        </Switch>
    );
};
RoutedIndividualContent.propTypes = {
    individual: individualPropTypesShape,
    data: PropTypes.array,
    renderContent: PropTypes.func,
    urlParam: PropTypes.string,
};
