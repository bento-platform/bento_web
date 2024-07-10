import React, { useEffect, useState } from "react";

import { read, utils, type WorkBook } from "xlsx";
import { Card } from "antd";

import SpreadsheetTable, { SPREADSHEET_ROW_KEY_PROP, SpreadsheetTableProps } from "./SpreadsheetTable";

type XlsxDisplayProps = {
  contents: Blob;
};

type XlsxRecord = Record<string, string>;
type XlsxData = XlsxRecord[];
type XlsxColumns = SpreadsheetTableProps<XlsxRecord>["columns"];

const XlsxDisplay = ({ contents }: XlsxDisplayProps) => {
  const [excelFile, setExcelFile] = useState<WorkBook | null>(null);
  const [reading, setReading] = useState(false);

  const [selectedSheet, setSelectedSheet] = useState<string | undefined>(undefined);
  const [sheetColumns, setSheetColumns] = useState<XlsxColumns>([]);
  const [sheetJSON, setSheetJSON] = useState<XlsxData>([]);

  useEffect(() => {
    if (!contents) return;
    setReading(true);
    contents
      .arrayBuffer()
      .then((ab) => {
        setExcelFile(read(ab));
      })
      .finally(() => setReading(false));
  }, [contents]);

  useEffect(() => {
    if (selectedSheet === undefined && excelFile?.SheetNames?.length) {
      setSelectedSheet(excelFile.SheetNames[0]);
    }
  }, [excelFile]);

  useEffect(() => {
    if (excelFile && selectedSheet !== undefined) {
      const json: object[] = utils.sheet_to_json(excelFile.Sheets[selectedSheet]);
      if (json.length === 0) return;

      const columnSet = new Set();
      const columns: XlsxColumns = [];

      // explore first 30 rows to find all columns
      json.slice(0, 30).forEach((row) => {
        Object.keys(row).forEach((c) => {
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
      tabList={(excelFile?.SheetNames ?? []).map((s) => ({ key: s, label: s }))}
      activeTabKey={selectedSheet}
      onTabChange={(s) => setSelectedSheet(s)}
    >
      <SpreadsheetTable<XlsxRecord>
        columns={sheetColumns}
        dataSource={sheetJSON}
        showHeader={sheetColumns.reduce((acc, v) => acc || v.title !== "", false)}
        loading={reading}
      />
    </Card>
  );
};

export default XlsxDisplay;
