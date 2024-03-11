import React, { memo } from "react";
import { Space, Table } from "antd";
import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import { runPropTypesShape } from "@/propTypes";

import DownloadButton from "@/components/DownloadButton";
import { useSelector } from "react-redux";

const MonospaceText = memo(({ children }) => (
    <span style={{ fontFamily: "monospace" }}>{children}</span>
));
MonospaceText.propTypes = {
    children: PropTypes.node,
};

const RunOutputValue = ({ runID, item: { name, type, value } }) => {
    const wesUrl = useSelector((state) => state.services.wesService?.url);

    const typeNoOpt = type.replace(/\?$/, "");

    if (typeNoOpt.startsWith("Array[")) {
        const innerType = typeNoOpt
            .replace(/^Array\[/, "")
            .replace(/]$/, "");
        return (
            <ul>
                {(value ?? []).map((v, vi) => (
                    <RunOutputValue key={`item-${vi}`} item={{ name: `${name}-${vi}`, type: innerType, value: v }} />
                ))}
            </ul>
        );
    } else if (["String", "Float", "Int", "Boolean"].includes(typeNoOpt)) {
        return <MonospaceText>{(value ?? EM_DASH).toString()}</MonospaceText>;
    } else if (typeNoOpt === "File") {
        if (value) {
            // TODO: Link
            return (
                <Space>
                    <MonospaceText>{value}</MonospaceText>
                    <DownloadButton
                        uri={`${wesUrl}/runs/${runID}/download-artifact`}
                        fileName={value.split("/").at(-1)}
                        extraFormData={{ path: value }}
                        size="small"
                    />
                </Space>
            );
        } else {
            return <MonospaceText>{EM_DASH}</MonospaceText>;
        }
    } else {  // Base case: JSON stringify
        return <MonospaceText>{JSON.stringify(value)}</MonospaceText>;
    }
};
RunOutputValue.propTypes = {
    runID: PropTypes.string,
    item: PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.string,
        value: PropTypes.any,
    }),
};

const RunOutputs = memo(({ run }) => {
    const outputItems = Object.entries(run.details?.outputs ?? {}).map(([k, v]) => ({ ...v, name: k }));

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (name) => <MonospaceText>{name}</MonospaceText>,
        },
        {
            title: "Type",
            dataIndex: "type",
        },
        {
            title: "Value",
            dataIndex: "value",
            render: (_, item) => <RunOutputValue runID={run.run_id} item={item} />,
        },
        // {
        //     key: "actions",
        //     title: "Actions",
        //     render: () => <>TODO</>,
        // },
    ];

    return (
        <Table
            columns={columns}
            dataSource={outputItems}
            rowKey="name"
            bordered={true}
            size="middle"
            pagination={false}
        />
    );
});
RunOutputs.propTypes = {
    run: runPropTypesShape,
};

export default RunOutputs;
