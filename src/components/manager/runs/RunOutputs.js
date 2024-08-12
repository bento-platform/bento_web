import React, { memo } from "react";
import PropTypes from "prop-types";

import { Space, Table } from "antd";

import { EM_DASH } from "@/constants";
import { runPropTypesShape } from "@/propTypes";

import DownloadButton from "@/components/common/DownloadButton";
import MonospaceText from "@/components/common/MonospaceText";
import { useService } from "@/modules/services/hooks";

const RunOutputValue = ({ runID, item: { name, type, value } }) => {
  const wesUrl = useService("wes")?.url;

  const typeNoOpt = type.replace(/\?$/, "");

  if (typeNoOpt.startsWith("Array[")) {
    const innerType = typeNoOpt.replace(/^Array\[/, "").replace(/]$/, "");
    return (
      <ul style={{ paddingLeft: "1.2rem", marginBottom: 0 }}>
        {(value ?? []).map((v, vi) => (
          <li key={`${name}-${vi}`}>
            <RunOutputValue item={{ name: `${name}-${vi}`, type: innerType, value: v }} />
          </li>
        ))}
      </ul>
    );
  } else if (typeNoOpt === "String") {
    return <MonospaceText style={{ whiteSpace: "pre-wrap" }}>{value}</MonospaceText>;
  } else if (["Float", "Int", "Boolean"].includes(typeNoOpt)) {
    return <MonospaceText>{(value ?? EM_DASH).toString()}</MonospaceText>;
  } else if (typeNoOpt === "File") {
    if (value) {
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
  } else {
    // Base case: JSON stringify
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
    <Table columns={columns} dataSource={outputItems} rowKey="name" bordered={true} size="middle" pagination={false} />
  );
});
RunOutputs.propTypes = {
  run: runPropTypesShape,
};

export default RunOutputs;
