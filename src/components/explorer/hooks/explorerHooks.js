import { useCallback, useMemo } from "react";

export const useSortedColumns = (data, tableSortOrder, columnsDefinition) => {
  const sortColumnKey = tableSortOrder?.sortColumnKey;
  const sortOrder = tableSortOrder?.sortOrder;

  const sortData = useCallback(
    (dataToSort, sortKey, order) => {
      const column = columnsDefinition.find((col) => col.dataIndex === sortKey);
      if (column && column.sorter) {
        return [...dataToSort].sort((a, b) => {
          return order === "ascend" ? column.sorter(a, b) : column.sorter(b, a);
        });
      }
      return dataToSort;
    },
    [columnsDefinition],
  );

  const sortedData = useMemo(
    () => sortData(data, sortColumnKey, sortOrder),
    [data, sortData, sortColumnKey, sortOrder],
  );

  const columnsWithSortOrder = useMemo(
    () =>
      columnsDefinition.map((column) => {
        if (column.dataIndex === sortColumnKey) {
          return { ...column, sortOrder };
        }
        return column;
      }),
    [sortColumnKey, sortOrder, columnsDefinition],
  );

  return { sortedData, columnsWithSortOrder };
};

export const useDynamicTableFilterOptions = (data, key) =>
  useMemo(() => {
    const uniqueValues = new Set(data.map((item) => item[key]));
    return Array.from(uniqueValues).map((value) => ({
      text: value,
      value: value,
    }));
  }, [data, key]);
