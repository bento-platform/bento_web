import { memo } from "react";

import type { TableColumnsType } from "antd";
import { Space, Table } from "antd";

import { EM_DASH } from "@/constants";
import DownloadButton from "@/components/common/DownloadButton";
import MonospaceText from "@/components/common/MonospaceText";
import { useService } from "@/modules/services/hooks";
import type { WorkflowRunOutput } from "@/modules/wes/types";

import type { RunPageProps } from "./types";

type OutputItem = WorkflowRunOutput & {
  name: string;
};

type RunOutputValueProps = {
  runID: string;
  item: OutputItem;
};

const RunOutputValue = ({ runID, item: { name, type, value } }: RunOutputValueProps) => {
  const wesUrl = useService("wes")?.url;

  const typeNoOpt = type.replace(/\?$/, "");

  if (typeNoOpt.startsWith("Array[")) {
    const innerType = typeNoOpt.replace(/^Array\[/, "").replace(/]$/, "");
    return (
      <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
        {((value ?? []) as string[] | number[] | boolean[]).map((v, vi) => (
          <li key={`${name}-${vi}`}>
            <RunOutputValue runID={runID} item={{ name: `${name}-${vi}`, type: innerType, value: v }} />
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
      const path = value as string;
      return (
        <Space>
          <MonospaceText>{path}</MonospaceText>
          <DownloadButton
            uri={`${wesUrl}/runs/${runID}/download-artifact`}
            fileName={path.split("/").at(-1)}
            extraFormData={{ path }}
            useBearerToken={true}
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

const RunOutputs = memo(({ run }: RunPageProps) => {
  const outputItems: OutputItem[] = Object.entries(run.details?.outputs ?? {}).map(([k, v]) => ({ ...v, name: k }));

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
  ] as TableColumnsType<OutputItem>;

  return (
    <Table columns={columns} dataSource={outputItems} rowKey="name" bordered={true} size="middle" pagination={false} />
  );
});

export default RunOutputs;
