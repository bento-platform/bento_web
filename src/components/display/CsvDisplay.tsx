import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Alert } from "antd";

import SpreadsheetTable, { SPREADSHEET_ROW_KEY_PROP, SpreadsheetTableProps } from "./SpreadsheetTable";
import type { BlobDisplayProps } from "./types";

const DEFAULT_COLUMN = { key: "col" };

type CsvRecord = Record<string, string>;
type CsvData = CsvRecord[];

type CsvParseResult = [SpreadsheetTableProps<CsvRecord>["columns"], CsvData];

const CsvDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const [parsedData, setParsedData] = useState<CsvData>([]);
  const [parseError, setParseError] = useState("");
  const [isParsing, setIsParsing] = useState(true); // Start in parsing state
  const [columns, setColumns] = useState<SpreadsheetTableProps<CsvRecord>["columns"]>([DEFAULT_COLUMN]);

  useEffect(() => {
    if (!contents) return;

    setIsParsing(true);

    contents
      .text()
      .then(
        (csvText) =>
          new Promise<CsvParseResult>((resolve, reject) => {
            const rows: CsvData = [];

            const innerParseErrors: string[] = [];

            // noinspection JSUnusedGlobalSymbols
            Papa.parse<string[]>(csvText, {
              worker: true,
              step: (res) => {
                if (res.errors?.length) {
                  innerParseErrors.push(...res.errors.map((e) => e.message));
                }
                rows.push(
                  Object.fromEntries([
                    [SPREADSHEET_ROW_KEY_PROP, `row${rows.length}`],
                    ...res.data.map((v, i) => [`col${i}`, v]),
                  ]),
                );
              },
              complete() {
                setIsParsing(false);

                if (innerParseErrors.length) {
                  reject(new Error(`Encountered parse error(s): ${innerParseErrors.join("; ")}`));
                } else {
                  resolve([
                    rows[0]
                      ? Object.entries(rows[0])
                          .filter(([k, _]) => k !== SPREADSHEET_ROW_KEY_PROP)
                          .map((_, i) => ({ dataIndex: `col${i}` }))
                      : [DEFAULT_COLUMN],
                    rows,
                  ]);
                }
              },
            });
          }),
      )
      .then(([columns, rows]: CsvParseResult) => {
        setColumns(columns);
        setParsedData(rows);
      })
      .catch((err) => {
        setParseError(err.toString());
      })
      .finally(() => setIsParsing(false));
  }, [contents]);

  if (parseError) {
    return <Alert message="Parsing error" description={parseError} type="error" showIcon={true} />;
  }

  return <SpreadsheetTable<CsvRecord> columns={columns} dataSource={parsedData} loading={loading || isParsing} />;
};

export default CsvDisplay;
