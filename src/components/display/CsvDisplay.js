import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Papa from "papaparse";
import { Alert, Table } from "antd";

const TABLE_PAGINATION = { pageSize: 25 };
const TABLE_SCROLL = { x: true };
const DEFAULT_COLUMN = { key: "col" };

const rowKey = (_, i) => `row${i}`;

const CsvDisplay = ({ contents, loading }) => {
    const [parsedData, setParsedData] = useState([]);
    const [parseError, setParseError] = useState("");
    const [isParsing, setIsParsing] = useState(true);  // Start in parsing state
    const [columns, setColumns] = useState([DEFAULT_COLUMN]);

    useEffect(() => {
        if (contents === undefined || contents === null) return;

        setIsParsing(true);
        const rows = [];
        Papa.parse(contents, {
            worker: true,
            step: (res) => {
                if (res.errors?.length) {
                    setParseError(res.errors[0].message);
                }
                rows.push(Object.fromEntries(res.data.map((v, i) => [`col${i}`, v])));
            },
            complete() {
                setIsParsing(false);
                if (!parseError) {
                    setColumns(rows[0] ? Object.entries(rows[0]).map((_, i) => ({
                        dataIndex: `col${i}`,
                    })) : [DEFAULT_COLUMN]);
                    setParsedData(rows);
                }
            },
        });
    }, [contents]);

    if (parseError) {
        return <Alert message="Parsing error" description={parseError} type="error" showIcon={true} />;
    }

    return (
        <Table
            size="small"
            bordered={true}
            showHeader={false}
            pagination={TABLE_PAGINATION}
            scroll={TABLE_SCROLL}
            loading={loading || isParsing}
            columns={columns}
            dataSource={parsedData}
            rowKey={rowKey}
        />
    );
};
CsvDisplay.propTypes = {
    contents: PropTypes.string,
    loading: PropTypes.bool,
};

export default CsvDisplay;
