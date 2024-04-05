import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { read, utils } from "xlsx";
import { Card } from "antd";

import SpreadsheetTable, { SPREADSHEET_ROW_KEY_PROP } from "./SpreadsheetTable";

const XlsxDisplay = ({ contents }) => {
    const [excelFile, setExcelFile] = useState(null);

    const [selectedSheet, setSelectedSheet] = useState(undefined);
    const [sheetColumns, setSheetColumns] = useState([]);
    const [sheetJSON, setSheetJSON] = useState([]);

    useEffect(() => {
        if (!contents) return;
        setExcelFile(read(contents));
    }, [contents]);

    useEffect(() => {
        if (selectedSheet === undefined && excelFile?.SheetNames?.length) {
            setSelectedSheet(excelFile.SheetNames[0]);
        }
    }, [excelFile]);

    useEffect(() => {
        if (excelFile) {
            const json = utils.sheet_to_json(excelFile.Sheets[selectedSheet]);
            if (json.length === 0) return [];

            const columnSet = new Set();
            const columns = [];

            // explore first 30 rows to find all columns
            json.slice(0, 30).forEach(row => {
                Object.keys(row).forEach(c => {
                    if (columnSet.has(c)) return;
                    columnSet.add(c);
                    columns.push({
                        title: c.startsWith("__") ? "" : c,
                        dataIndex: c,
                    });
                });
            });

            setSheetColumns(columns);
            setSheetJSON(json.map((r, i) => ({ ...r, [SPREADSHEET_ROW_KEY_PROP]: `row${i}` })));
        }
    }, [selectedSheet]);

    return (
        <Card
            tabList={(excelFile?.SheetNames ?? []).map((s) => ({key: s, tab: s}))}
            activeTabKey={selectedSheet}
            onTabChange={(s) => setSelectedSheet(s)}
        >
            <SpreadsheetTable
                columns={sheetColumns}
                dataSource={sheetJSON}
                showHeader={sheetColumns.reduce((acc, v) => acc || v.title !== "", false)}
            />
        </Card>
    );
};
XlsxDisplay.propTypes = {
    contents: PropTypes.instanceOf(ArrayBuffer),
};

export default XlsxDisplay;
