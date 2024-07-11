import { type CSSProperties, useEffect, useMemo, useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import { Alert, Skeleton } from "antd";

const MAMMOTH_OPTIONS = {
  convertImage: mammoth.images.imgElement((image) =>
    image.read("base64").then((buffer) => ({
      src: `data:${image.contentType};base64,${buffer}`,
      style: "max-width: 90%; height: auto; margin: 0.5em 5%;",
    })),
  ),
};

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: 960, // Maximum width to roughly a nice page
    overflowX: "auto",
  },
};

type DocxDisplayProps = {
  contents: Blob;
  loading?: boolean;
};

const DocxDisplay = ({ contents, loading }: DocxDisplayProps) => {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docHTML, setDocHTML] = useState<string | null>(null);

  useEffect(() => {
    if (!contents) return;

    (async () => {
      setDocHTML(null); // reset HTML contents if array buffer contents changes
      setError(null); // reset error if array buffer contents changes
      setParsing(true);

      try {
        const res = await mammoth.convertToHtml({ arrayBuffer: await contents.arrayBuffer() }, MAMMOTH_OPTIONS);
        res.messages.forEach((msg) => console.info("Received message while parsing .docx:", msg));
        setDocHTML(res.value);
      } catch (err) {
        console.error("Received error while parsing .docx:", err);
        setError((err as Error).toString());
      } finally {
        setParsing(false);
      }
    })();
  }, [contents]);

  const innerHTML = useMemo(() => ({ __html: docHTML ?? "<div />" }), [docHTML]);

  const waiting = loading || parsing;

  // noinspection JSValidateTypes
  return (
    <>
      <Skeleton active={true} loading={waiting} />
      {error && <Alert showIcon={true} message="Parsing error" description={error} />}
      <div style={styles.container} dangerouslySetInnerHTML={innerHTML} />
    </>
  );
};

export default DocxDisplay;
