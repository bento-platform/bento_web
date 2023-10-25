import React, { useEffect, useMemo, useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import { Alert, Skeleton, Spin } from "antd";
import PropTypes from "prop-types";

const MAMMOTH_OPTIONS = {
    convertImage: mammoth.images.imgElement((image) =>
        image.read("base64").then((buffer) => ({
            src: `data:${image.contentType};base64,${buffer}`,
            style: "max-width: 90%; height: auto; margin: 0.5em 5%;",
        })),
    ),
};

const DocxDisplay = ({ contents, loading }) => {
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState(null);
    const [docHTML, setDocHTML] = useState(null);

    useEffect(() => {
        if (!contents) return;

        (async () => {
            setDocHTML(null);  // reset HTML contents if array buffer contents changes
            setError(null);  // reset error if array buffer contents changes
            setParsing(true);

            try {
                const res = await mammoth.convertToHtml({ arrayBuffer: contents }, MAMMOTH_OPTIONS);
                res.messages.forEach((msg) => console.info("Received message while parsing .docx:", msg));
                setDocHTML(res.value);
            } catch (err) {
                console.error("Received error while parsing .docx:", err);
                setError(err);
            } finally {
                setParsing(false);
            }
        })();
    }, [contents]);

    const innerHTML = useMemo(() => ({ __html: docHTML ?? "<div />" }), [docHTML]);

    const waiting = loading || parsing;

    // noinspection JSValidateTypes
    return <Spin spinning={waiting}>
        {waiting && <Skeleton loading={true} />}
        {error && (
            <Alert showIcon={true} message="Parsing error" description={error} />
        )}
        <div dangerouslySetInnerHTML={innerHTML} />
    </Spin>;
};
DocxDisplay.propTypes = {
    contents: PropTypes.instanceOf(ArrayBuffer),
    loading: PropTypes.bool,
};

export default DocxDisplay;
