import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Papa from "papaparse";
import { Alert, Table } from "antd";

const DEFAULT_COLUMN = { key: "col" };

const CsvDisplay = ({ contents }) => {
    const [parsedData, setParsedData] = useState([]);
    const [parseError, setParseError] = useState("");
    const [isParsing, setIsParsing] = useState(true);  // Start in parsing state
    const [columns, setColumns] = useState([DEFAULT_COLUMN]);

    useEffect(() => {
        if (contents === undefined || contents === null) return;

        setIsParsing(true);

        console.log(contents);

        const rows = [];
        Papa.parse(contents, {
            worker: true,
            step: (res) => {
                console.log(res);
                if (res.errors?.length) {
                    setParseError(res.errors[0].message);
                }
                rows.push(Object.fromEntries(res.data.map((v, i) => [`col${i}`, v])));
            },
            complete() {
                setIsParsing(false);
                if (!parseError) {
                    console.log('first row', rows[0]);
                    setColumns(rows[0] ? Object.entries(rows[0]).map((_, i) => ({
                        dataIndex: `col${i}`,
                    })) : [DEFAULT_COLUMN]);
                    setParsedData(rows);
                }
            },
        })
    }, [contents]);

    if (parseError) {
        return <Alert message="Parsing error" description={parseError} type="error" showIcon={true} />;
    }

    return (
        <Table
            size="small"
            bordered={true}
            showHeader={false}
            pagination={false}
            scroll={{x: true}}
            loading={isParsing}
            columns={columns}
            dataSource={parsedData}
            rowKey={(_, i) => `row${i}`}
        />
    );
};
CsvDisplay.propTypes = {
    contents: PropTypes.string,
};

export default CsvDisplay;
