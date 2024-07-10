import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Alert } from "antd";

import SpreadsheetTable, { SPREADSHEET_ROW_KEY_PROP, SpreadsheetTableProps } from "./SpreadsheetTable";

const DEFAULT_COLUMN = { key: "col" };

type CsvDisplayProps = {
  contents?: string | null;
  loading?: boolean;
};

type CsvRecord = Record<string, string>;
type CsvData = CsvRecord[];

const CsvDisplay = ({ contents, loading }: CsvDisplayProps) => {
  const [parsedData, setParsedData] = useState<CsvData>([]);
  const [parseError, setParseError] = useState("");
  const [isParsing, setIsParsing] = useState(true); // Start in parsing state
  const [columns, setColumns] = useState<SpreadsheetTableProps<CsvRecord>["columns"]>([DEFAULT_COLUMN]);

  useEffect(() => {
    if (contents === undefined || contents === null) return;

    setIsParsing(true);
    const rows: CsvData = [];
    // noinspection JSUnusedGlobalSymbols
    Papa.parse<string[]>(contents, {
      worker: true,
      step: (res) => {
        if (res.errors?.length) {
          setParseError(res.errors[0].message);
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
        if (!parseError) {
          setColumns(
            rows[0]
              ? Object.entries(rows[0])
                  .filter(([k, _]) => k !== SPREADSHEET_ROW_KEY_PROP)
                  .map((_, i) => ({ dataIndex: `col${i}` }))
              : [DEFAULT_COLUMN],
          );
          setParsedData(rows);
        }
      },
    });
  }, [contents]);

  if (parseError) {
    return <Alert message="Parsing error" description={parseError} type="error" showIcon={true} />;
  }

  return <SpreadsheetTable<CsvRecord> columns={columns} dataSource={parsedData} loading={loading || isParsing} />;
};

export default CsvDisplay;
