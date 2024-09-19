import { memo } from "react";
import { Skeleton } from "antd";
import { AnsiUp } from "ansi_up";

const ansiUp = new AnsiUp();

type LogOutputProps = {
  log?: {
    data: string | null;
  };
};

const LogOutput = memo(({ log }: LogOutputProps) => {
  if (!log) return <Skeleton paragraph={false} />;

  return (
    <div
      style={{ fontFamily: "monospace", fontSize: "12px", whiteSpace: "break-spaces", overflowX: "auto" }}
      dangerouslySetInnerHTML={{ __html: ansiUp.ansi_to_html(log?.data || "") }}
    />
  );
});

export default LogOutput;
