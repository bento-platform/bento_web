import { useMemo } from "react";

export const useSortedColumns = (data, tableSortOrder, columnsDefinition) => {
    const sortColumnKey = tableSortOrder?.sortColumnKey;
    const sortOrder = tableSortOrder?.sortOrder;

    const sortData = (dataToSort, sortKey, order) => {
        const column = columnsDefinition.find((col) => col.dataIndex === sortKey);
        if (column && column.sorter) {
            return [...dataToSort].sort((a, b) => {
                return order === "ascend" ? column.sorter(a, b) : -column.sorter(a, b);
            });
        }
        return dataToSort;
    };

    const sortedData = useMemo(() => {
        return sortData(data, sortColumnKey, sortOrder);
    }, [data, sortColumnKey, sortOrder, columnsDefinition]);

    const columnsWithSortOrder = useMemo(() => {
        return columnsDefinition.map((column) => {
            if (column.dataIndex === sortColumnKey) {
                return { ...column, sortOrder };
            }
            return column;
        });
    }, [sortColumnKey, sortOrder, columnsDefinition]);

    return { sortedData, columnsWithSortOrder };
};
