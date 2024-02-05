import React, { useState } from "react";
import PropTypes from "prop-types";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { markdown } from "react-syntax-highlighter/dist/cjs/languages/hljs";

SyntaxHighlighter.registerLanguage("markdown", markdown);

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Radio } from "antd";
import { Icon } from "@ant-design/compatible";

const REMARK_PLUGINS = [remarkGfm];

/** @type {Object.<string, React.CSSProperties>} */
const styles = {
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

const MarkdownDisplay = ({ contents }) => {
    const [displayMode, setDisplayMode] = useState("render");

    // We use a 0-height container for the rendered Markdown instead of trashing it in order to preserve the same width
    // between the rendered and code views of the same content.

    return <div style={styles.container}>
        <div style={styles.header}>
            <Radio.Group defaultValue="render" onChange={v => setDisplayMode(v.target.value)}>
                <Radio.Button value="render"><Icon type="pic-right" /> Render</Radio.Button>
                <Radio.Button value="code"><Icon type="code" /> Code</Radio.Button>
            </Radio.Group>
        </div>
        <div style={{ overflowY: "hidden", height: displayMode === "code" ? 0 : "auto" }}>
            <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{contents}</ReactMarkdown>
        </div>
        {displayMode === "code" ? (
            <SyntaxHighlighter
                language="markdown"
                style={a11yLight}
                customStyle={styles.code}
                showLineNumbers={true}
            >
                {contents || ""}
            </SyntaxHighlighter>
        ) : null}
    </div>;
};
MarkdownDisplay.propTypes = {
    contents: PropTypes.string,
};

export default MarkdownDisplay;
