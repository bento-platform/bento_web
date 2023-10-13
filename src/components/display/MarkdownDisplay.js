import React, { useState } from "react";
import PropTypes from "prop-types";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { markdown } from "react-syntax-highlighter/dist/cjs/languages/hljs";

SyntaxHighlighter.registerLanguage("markdown", markdown);

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Icon, Radio } from "antd";

const REMARK_PLUGINS = [remarkGfm];

const MarkdownDisplay = ({ contents }) => {
    const [displayMode, setDisplayMode] = useState("render");

    return <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: 0, top: 0 }}>
            <Radio.Group defaultValue="render" onChange={v => setDisplayMode(v.target.value)}>
                <Radio.Button value="render"><Icon type="pic-right" /> Render</Radio.Button>
                <Radio.Button value="code"><Icon type="code" /> Code</Radio.Button>
            </Radio.Group>
        </div>
        {displayMode === "code" ? (
            <SyntaxHighlighter
                language="markdown"
                style={a11yLight}
                customStyle={{fontSize: "12px"}}
                showLineNumbers={true}
            >
                {contents || ""}
            </SyntaxHighlighter>
        ) : (
            <ReactMarkdown children={contents} remarkPlugins={REMARK_PLUGINS} />
        )}
    </div>;
};
MarkdownDisplay.propTypes = {
    contents: PropTypes.string,
};

export default MarkdownDisplay;
