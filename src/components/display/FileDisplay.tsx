import { useCallback, useEffect, useState } from "react";
import { Alert, Skeleton, Spin } from "antd";
import { useAuthorizationHeader } from "bento-auth-js";

import fetch from "cross-fetch";

import type { JSONType } from "ajv";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import dockerfile from "react-syntax-highlighter/dist/esm/languages/hljs/dockerfile";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";
import plaintext from "react-syntax-highlighter/dist/esm/languages/hljs/plaintext";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import r from "react-syntax-highlighter/dist/esm/languages/hljs/r";
import shell from "react-syntax-highlighter/dist/esm/languages/hljs/shell";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import AudioDisplay from "./AudioDisplay";
import CsvDisplay from "./CsvDisplay";
import ImageBlobDisplay from "./ImageBlobDisplay";
import JsonDisplay from "./JsonDisplay";
import VideoDisplay from "./VideoDisplay";
import XlsxDisplay from "./XlsxDisplay";
import MarkdownDisplay from "./MarkdownDisplay";
import DocxDisplay from "./DocxDisplay";
import PdfDisplay from "./PdfDisplay";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("dockerfile", dockerfile);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("r", r);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("xml", xml);

const LANGUAGE_HIGHLIGHTERS: Record<string, string> = {
  bash: "bash",
  js: "javascript",
  json: "json",
  md: "markdown",
  mjs: "javascript",
  txt: "plaintext",
  py: "python",
  R: "r",
  sh: "shell",
  xml: "xml",

  // Special files
  Dockerfile: "dockerfile",
  README: "plaintext",
  CHANGELOG: "plaintext",
};

export const AUDIO_FILE_EXTENSIONS = ["3gp", "aac", "flac", "m4a", "mp3", "ogg", "wav"];

const CSV_LIKE_FILE_EXTENSIONS = ["csv", "tsv"];

export const IMAGE_FILE_EXTENSIONS = ["apng", "avif", "bmp", "gif", "jpg", "jpeg", "png", "svg", "webp"];

export const VIDEO_FILE_EXTENSIONS = ["mp4", "webm"];

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
  "docx",
  "pdf",

  // Tabular data
  ...CSV_LIKE_FILE_EXTENSIONS,
  "csv",
  "tsv",
  "xls",
  "xlsx",

  // Code & text formats
  ...Object.keys(LANGUAGE_HIGHLIGHTERS),
];

const DEFER_LOADING_FILE_EXTENSIONS = ["pdf"]; // Don't use a fetch() for these extensions

type WrappedJsonDisplayProps = { contents?: Blob; loading?: boolean };

const WrappedJsonDisplay = ({ contents, loading }: WrappedJsonDisplayProps) => {
  const [parsing, setParsing] = useState(false);
  const [json, setJson] = useState<JSONType | undefined>(undefined);

  useEffect(() => {
    if (contents) {
      setParsing(true);
      contents
        .text()
        .then((jt) => setJson(JSON.parse(jt)))
        .finally(() => setParsing(false));
    }
  }, [contents]);

  return (
    <>
      <Skeleton active={true} loading={loading || parsing} />
      <JsonDisplay jsonSrc={json} />
    </>
  );
};

type WrappedCodeDisplayProps = { contents?: Blob; fileExt: string; loading?: boolean };

const WrappedCodeDisplay = ({ contents, fileExt, loading }: WrappedCodeDisplayProps) => {
  const [decoding, setDecoding] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (contents) {
      setDecoding(true);
      contents
        .text()
        .then((mt) => setCode(mt))
        .finally(() => setDecoding(false));
    }
  }, [contents, loading]);

  if (fileExt === "md") {
    return <MarkdownDisplay contents={code} loading={loading || decoding} />;
  } else {
    return (
      <>
        <Skeleton active={true} loading={loading || decoding} />
        <SyntaxHighlighter
          language={LANGUAGE_HIGHLIGHTERS[fileExt]}
          style={a11yLight}
          customStyle={{ fontSize: "12px" }}
          showLineNumbers={true}
        >
          {code || ""}
        </SyntaxHighlighter>
      </>
    );
  }
};

type FileDisplayProps = {
  uri?: string;
  fileName?: string;
  loading?: boolean;
};

const FileDisplay = ({ uri, fileName, loading }: FileDisplayProps) => {
  const authHeader = useAuthorizationHeader();

  const [fileLoadError, setFileLoadError] = useState("");
  const [loadingFileContents, setLoadingFileContents] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, Blob>>({});

  const fileExt = fileName ? fileName.split(".").slice(-1)[0].toLowerCase() : "";

  useEffect(() => {
    // File changed, so reset the load error
    setFileLoadError("");

    (async () => {
      if (!fileName) return;

      if (fileExt === "pdf") {
        setLoadingFileContents(true);
      }

      if (DEFER_LOADING_FILE_EXTENSIONS.includes(fileExt) || (uri && fileContents.hasOwnProperty(uri))) return;

      if (!uri) {
        console.error(`Files: something went wrong while trying to load ${uri}`);
        setFileLoadError("Could not find URI for file.");
        return;
      }

      try {
        setLoadingFileContents(true);
        const r = await fetch(uri, { headers: authHeader });
        if (r.ok) {
          setFileContents({
            ...fileContents,
            [uri]: await r.blob(),
          });
        } else {
          setFileLoadError(`Could not load file: ${await r.text()}`);
        }
      } catch (e) {
        console.error(e);
        setFileLoadError(`Could not load file: ${(e as Error).message}`);
      } finally {
        setLoadingFileContents(false);
      }
    })();
  }, [fileName, fileExt, uri, fileContents, authHeader]);

  const onPdfLoad = useCallback(() => {
    setLoadingFileContents(false);
  }, []);

  const onPdfFail = useCallback((err: Error) => {
    setLoadingFileContents(false);
    setFileLoadError(`Error loading PDF: ${err.message}`);
  }, []);

  if (!uri || !fileName) {
    console.error(`Missing URI or file name: uri=${uri}, fileName=${fileName}`);
    return <div />;
  }

  return (
    <Spin spinning={loading}>
      {(() => {
        if (fileLoadError) {
          return (
            <Alert
              type="error"
              message={`Error loading file: ${fileName}`}
              description={fileLoadError}
              showIcon={true}
            />
          );
        }

        const fc = fileContents[uri]; // undefined for PDF or if not loaded yet

        if (fileExt === "pdf") {
          // Non-text, content isn't loaded a priori
          return <PdfDisplay uri={uri} onLoad={onPdfLoad} onFail={onPdfFail} />;
        } else if (fileExt === "docx") {
          return <DocxDisplay contents={fc} loading={loadingFileContents} />;
        } else if (CSV_LIKE_FILE_EXTENSIONS.includes(fileExt)) {
          return <CsvDisplay contents={fc} loading={loadingFileContents} />;
        } else if (["xls", "xlsx"].includes(fileExt)) {
          return <XlsxDisplay contents={fc} loading={loadingFileContents} />;
        } else if (AUDIO_FILE_EXTENSIONS.includes(fileExt)) {
          return <AudioDisplay blob={fc} loading={loadingFileContents} />;
        } else if (IMAGE_FILE_EXTENSIONS.includes(fileExt)) {
          return <ImageBlobDisplay alt={fileName} blob={fc} loading={loadingFileContents} />;
        } else if (VIDEO_FILE_EXTENSIONS.includes(fileExt)) {
          return <VideoDisplay blob={fc} loading={loadingFileContents} />;
        } else if (fileExt === "json") {
          return <WrappedJsonDisplay contents={fc} loading={loadingFileContents} />;
        } else {
          return <WrappedCodeDisplay contents={fc} fileExt={fileExt} loading={loadingFileContents} />;
        }
      })()}
    </Spin>
  );
};

export default FileDisplay;
