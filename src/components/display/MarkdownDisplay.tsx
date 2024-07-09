import { type CSSProperties, useCallback, useMemo, useState } from "react";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import markdown from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";

SyntaxHighlighter.registerLanguage("markdown", markdown);

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { type CheckboxOptionType, Radio, type RadioChangeEvent } from "antd";
import { CodeOutlined, PicRightOutlined } from "@ant-design/icons";

const REMARK_PLUGINS = [remarkGfm];

const styles: Record<string, CSSProperties> = {
  container: {
    position: "relative",
    maxWidth: 960,
    overflowX: "auto",
  },
  header: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  code: {
    fontSize: "12px",
  },
};

const DISPLAY_MODE_OPTIONS: CheckboxOptionType[] = [
  {
    label: (
      <>
        <PicRightOutlined /> Render
      </>
    ),
    value: "render",
  },
  {
    label: (
      <>
        <CodeOutlined /> Code
      </>
    ),
    value: "code",
  },
];

type MarkdownDisplayProps = {
  contents?: string;
};

const MarkdownDisplay = ({ contents }: MarkdownDisplayProps) => {
  const [displayMode, setDisplayMode] = useState<"render" | "code">("render");

  const onModeChange = useCallback((v: RadioChangeEvent) => setDisplayMode(v.target.value), []);

  // We use a 0-height container for the rendered Markdown instead of trashing it in order to preserve the same width
  // between the rendered and code views of the same content.

  const markdownContainerStyle = useMemo<CSSProperties>(
    () => ({ overflowY: "hidden", height: displayMode === "code" ? 0 : "auto" }),
    [displayMode]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Radio.Group defaultValue="render" onChange={onModeChange} options={DISPLAY_MODE_OPTIONS} />
      </div>
      <div style={markdownContainerStyle}>
        <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{contents ?? ""}</ReactMarkdown>
      </div>
      {displayMode === "code" ? (
        <SyntaxHighlighter language="markdown" style={a11yLight} customStyle={styles.code} showLineNumbers={true}>
          {contents ?? ""}
        </SyntaxHighlighter>
      ) : null}
    </div>
  );
};

export default MarkdownDisplay;
