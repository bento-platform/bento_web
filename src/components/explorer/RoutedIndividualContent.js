import { useCallback, useMemo } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

import { Table } from "antd";

export const RoutedIndividualContentTable = ({
  data,
  urlParam,
  columns,
  rowKey,
  handleRowSelect,
  expandedRowRender,
}) => {
  const paramValue = useParams()[urlParam];
  const expandedRowKeys = useMemo(() => (paramValue ? [paramValue] : []), [paramValue]);
  const onExpand = useCallback(
    (e, record) => {
      let selected = undefined;
      if (e) {
        if (typeof rowKey === "function") {
          selected = rowKey(record);
        } else {
          selected = record[rowKey];
        }
      }
      handleRowSelect(selected);
    },
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
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  handleRowSelect: PropTypes.func,
  expandedRowRender: PropTypes.func,
};

export const RoutedIndividualContent = ({ renderContent, urlParam }) => {
  const navigate = useNavigate();

  const handleRoutedSelection = useCallback(
    (selected) => {
      if (!selected) {
        navigate("", { replace: true });
        return;
      }
      navigate(`${selected}`, { replace: true });
    },
    [navigate],
  );

  const contentNode = useMemo(
    () => renderContent({ onContentSelect: handleRoutedSelection }),
    [renderContent, handleRoutedSelection],
  );

  return (
    <Routes>
      <Route path={`:${urlParam}/*`} element={contentNode} />
      <Route path="/" element={contentNode} />
    </Routes>
  );
};
RoutedIndividualContent.propTypes = {
  renderContent: PropTypes.func,
  urlParam: PropTypes.string,
};
