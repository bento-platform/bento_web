import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Skeleton, Spin } from "antd";

import fetch from "cross-fetch";

import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import {
    bash,
    dockerfile,
    json,
    markdown,
    plaintext,
    python,
    r,
    shell,
    xml,
} from "react-syntax-highlighter/dist/cjs/languages/hljs";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { useAuthorizationHeader } from "../../lib/auth/utils";

import AudioDisplay from "./AudioDisplay";
import CsvDisplay from "./CsvDisplay";
import ImageBlobDisplay from "./ImageBlobDisplay";
import JsonDisplay from "./JsonDisplay";
import VideoDisplay from "./VideoDisplay";
import XlsxDisplay from "./XlsxDisplay";
import MarkdownDisplay from "./MarkdownDisplay";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("dockerfile", dockerfile);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("r", r);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("xml", xml);

const BASE_PDF_OPTIONS = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
};

const LANGUAGE_HIGHLIGHTERS = {
    "bash": "bash",
    "json": "json",
    "md": "markdown",  // TODO: component to either render this or show source
    "txt": "plaintext",
    "py": "python",
    "R": "r",
    "sh": "shell",
    "xml": "xml",

    // Special files
    "Dockerfile": "dockerfile",
    "README": "plaintext",
    "CHANGELOG": "plaintext",
};

const AUDIO_FILE_EXTENSIONS = [
    "3gp",
    "aac",
    "flac",
    "m4a",
    "mp3",
    "ogg",
    "wav",
];

const IMAGE_FILE_EXTENSIONS = [
    "apng",
    "avif",
    "bmp",
    "gif",
    "jpg",
    "jpeg",
    "png",
    "svg",
    "webp",
];

const VIDEO_FILE_EXTENSIONS = [
    "mp4",
    "webm",
];

// TODO: ".bed",
//  .bed files are basically TSVs, but they can have instructions and can be whitespace-delimited instead
export const VIEWABLE_FILE_EXTENSIONS = [
    // Audio
    ...AUDIO_FILE_EXTENSIONS,

    // Images
    ...IMAGE_FILE_EXTENSIONS,

    // Videos
    ...VIDEO_FILE_EXTENSIONS,

    // Documents
    "pdf",

    // Tabular data
    "csv",
    "tsv",
    "xls",
    "xlsx",

    // Code & text formats
    ...Object.keys(LANGUAGE_HIGHLIGHTERS),
];

const DEFER_LOADING_FILE_EXTENSIONS = ["pdf"];  // Don't use a fetch() for these extensions
const ARRAY_BUFFER_FILE_EXTENSIONS = ["xls", "xlsx"];
const BLOB_FILE_EXTENSIONS = [...AUDIO_FILE_EXTENSIONS, ...IMAGE_FILE_EXTENSIONS, ...VIDEO_FILE_EXTENSIONS, "pdf"];

const FileDisplay = ({ uri, fileName, loading }) => {
    const authHeader = useAuthorizationHeader();

    const [fileLoadError, setFileLoadError] = useState("");
    const [loadingFileContents, setLoadingFileContents] = useState(false);
    const [fileContents, setFileContents] = useState({});
    const [pdfPageCounts, setPdfPageCounts] = useState({});

    const pdfOptions = useMemo(() => ({
        ...BASE_PDF_OPTIONS,
        httpHeaders: authHeader,
    }), [authHeader]);

    const fileExt = fileName ? fileName.split(".").slice(-1)[0].toLowerCase() : null;

    useEffect(() => {
        // File changed, so reset the load error
        setFileLoadError("");

        (async () => {
            if (!fileName) return;

            if (fileExt === "pdf") {
                setLoadingFileContents(true);
            }

            if (DEFER_LOADING_FILE_EXTENSIONS.includes(fileExt) || fileContents.hasOwnProperty(uri)) return;

            if (!uri) {
                console.error(`Files: something went wrong while trying to load ${uri}`);
                setFileLoadError("Could not find URI for file.");
                return;
            }

            try {
                setLoadingFileContents(true);
                const r = await fetch(uri, { headers: authHeader });
                if (r.ok) {
                    let content;
                    if (ARRAY_BUFFER_FILE_EXTENSIONS.includes(fileExt)) {
                        content = await r.arrayBuffer();
                    } else if (BLOB_FILE_EXTENSIONS.includes(fileExt)) {
                        content = await r.blob();
                    } else {
                        const text = await r.text();
                        content = (fileExt === "json" ? JSON.parse(text) : text);
                    }
                    setFileContents({
                        ...fileContents,
                        [uri]: content,
                    });
                } else {
                    setFileLoadError(`Could not load file: ${r.content}`);
                }
            } catch (e) {
                console.error(e);
                setFileLoadError(`Could not load file: ${e.message}`);
            } finally {
                setLoadingFileContents(false);
            }
        })();
    }, [uri]);

    const onPdfLoad = useCallback(({numPages}) => {
        setLoadingFileContents(false);
        setPdfPageCounts({...pdfPageCounts, [uri]: numPages});
    }, [uri]);

    const onPdfFail = useCallback(err => {
        console.error(err);
        setLoadingFileContents(false);
        setFileLoadError(`Error loading PDF: ${err.message}`);
    }, []);

    if (!uri || !fileName) {
        console.error(`Missing URI or file name: uri=${uri}, fileName=${fileName}`);
        return <div />;
    }

    return <Spin spinning={loading || loadingFileContents}>
        {(() => {
            if (fileLoadError) {
                return <Alert
                    type="error"
                    message={`Error loading file: ${fileName}`}
                    description={fileLoadError}
                    showIcon={true}
                />;
            }

            const fc = fileContents[uri];  // undefined for PDF or if not loaded yet

            if (fileExt === "pdf") {  // Non-text, content isn't loaded a priori
                return (
                    <Document file={uri} onLoadSuccess={onPdfLoad} onLoadError={onPdfFail} options={pdfOptions}>
                        {(() => {
                            const pages = [];
                            for (let i = 1; i <= pdfPageCounts[uri] ?? 1; i++) {
                                pages.push(<Page pageNumber={i} key={i} />);
                            }
                            return pages;
                        })()}
                    </Document>
                );
            } else if (["csv", "tsv"].includes(fileExt)) {
                if (loadingFileContents) return <div />;
                return <CsvDisplay contents={fc} />;
            } else if (["xls", "xlsx"].includes(fileExt)) {
                if (loadingFileContents) return <div />;
                return <XlsxDisplay content={fc} />;
            } else if (AUDIO_FILE_EXTENSIONS.includes(fileExt)) {
                if (loadingFileContents) return <div />;
                return <AudioDisplay blob={fc} />;
            } else if (IMAGE_FILE_EXTENSIONS.includes(fileExt)) {
                if (loadingFileContents) return <div />;
                return <ImageBlobDisplay alt={fileName} blob={fc} />;
            } else if (VIDEO_FILE_EXTENSIONS.includes(fileExt)) {
                if (loadingFileContents) return <div />;
                return <VideoDisplay blob={fc} />;
            } else if (fileExt === "json") {
                if (loadingFileContents || !fc) return <div/>;
                return <JsonDisplay jsonSrc={fc}/>;
            } else if (fileExt === "md") {
                if (loadingFileContents) return <Skeleton loading={true} />;
                return <MarkdownDisplay contents={fc} />;
            } else {  // if (textFormat)
                return (
                    <SyntaxHighlighter
                        language={LANGUAGE_HIGHLIGHTERS[fileExt]}
                        style={a11yLight}
                        customStyle={{fontSize: "12px"}}
                        showLineNumbers={true}
                    >
                        {fc || ""}
                    </SyntaxHighlighter>
                );
            }
        })()}
    </Spin>;
};
FileDisplay.propTypes = {
    uri: PropTypes.string,
    fileName: PropTypes.string,
    loading: PropTypes.bool,
};

export default FileDisplay;
