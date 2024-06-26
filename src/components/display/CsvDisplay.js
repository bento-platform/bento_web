import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Papa from "papaparse";
import { Alert } from "antd";

import SpreadsheetTable, { SPREADSHEET_ROW_KEY_PROP } from "./SpreadsheetTable";

const DEFAULT_COLUMN = { key: "col" };

const CsvDisplay = ({ contents, loading }) => {
  const [parsedData, setParsedData] = useState([]);
  const [parseError, setParseError] = useState("");
  const [isParsing, setIsParsing] = useState(true); // Start in parsing state
  const [columns, setColumns] = useState([DEFAULT_COLUMN]);

  useEffect(() => {
    if (contents === undefined || contents === null) return;

    setIsParsing(true);
    const rows = [];
    // noinspection JSUnusedGlobalSymbols
    Papa.parse(contents, {
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

  return <SpreadsheetTable columns={columns} dataSource={parsedData} loading={loading || isParsing} />;
};
CsvDisplay.propTypes = {
  contents: PropTypes.string,
  loading: PropTypes.bool,
};

export default CsvDisplay;
