import React, { useCallback, useMemo } from "react";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom";
import PropTypes from "prop-types";

import { Table } from "antd";

export const RoutedIndividualContentTable = ({data, urlParam, columns, rowKey, handleRowSelect, expandedRowRender}) => {
    const paramValue = useParams()[urlParam];
    const expandedRowKeys = useMemo(() => paramValue ? [paramValue] : [], [paramValue]);
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
            expandable={{ onExpand, expandedRowKeys, expandedRowRender }}
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

export const RoutedIndividualContent = ({ renderContent, urlParam }) => {
    const history = useHistory();
    const { path, url } = useRouteMatch();

    const handleRoutedSelection = useCallback((selected) => {
        if (!selected) {
            history.replace(url);
            return;
        }
        history.replace(`${url}/${selected}`);
    }, [history, url]);

    const contentNode = useMemo(
        () => renderContent({ onContentSelect: handleRoutedSelection }),
        [handleRoutedSelection]);

    return (
        <Switch>
            <Route path={`${path}/:${urlParam}`}>{contentNode}</Route>
            <Route path={path}>{contentNode}</Route>
        </Switch>
    );
};
RoutedIndividualContent.propTypes = {
    renderContent: PropTypes.func,
    urlParam: PropTypes.string,
};
