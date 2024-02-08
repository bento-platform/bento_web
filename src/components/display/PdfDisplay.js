import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import { useAuthorizationHeader } from "bento-auth-js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

const BASE_PDF_OPTIONS = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
};

const SCALES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const INITIAL_SCALE = 2;
const MAX_SCALE = SCALES.length - 1;

/** @type {Object.<string, React.CSSProperties>} */
const styles = {
    container: {
        width: "calc(90vw - 32px)",
        minWidth: "660px",
    },
    header: {
        position: "absolute",
        right: 30,
        top: -68,
    },
};

const PdfDisplay = ({uri, onLoad, onFail}) => {
    const authHeader = useAuthorizationHeader();

    const [pdfPageCounts, setPdfPageCounts] = useState({});
    const [scale, setScale] = useState(INITIAL_SCALE);

    const pdfOptions = useMemo(() => ({
        ...BASE_PDF_OPTIONS,
        httpHeaders: authHeader,
    }), [authHeader]);

    const onLoadSuccess = useCallback(({numPages}) => {
        if (onLoad) onLoad();
        setPdfPageCounts({...pdfPageCounts, [uri]: numPages});
    }, [uri]);

    const onLoadError = useCallback(err => {
        console.error(err);
        if (onFail) onFail(err);
    }, []);

    const decreaseScale = useCallback(() => {
        const newScale = Math.max(scale - 1, 0);
        console.info("setting PDF zoom scale to", newScale);
        setScale(newScale);
    }, [scale]);

    const increaseScale = useCallback(() => {
        const newScale = Math.min(scale + 1, MAX_SCALE);
        console.info("setting PDF zoom scale to", newScale);
        setScale(newScale);
    }, [scale]);

    const pageArray = useMemo(() => {
        const pages = [];
        for (let i = 1; i <= pdfPageCounts[uri] ?? 1; i++) {
            pages.push(<Page pageNumber={i} key={i} scale={SCALES[scale]} />);
        }
        return pages;
    }, [pdfPageCounts, uri, scale]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Button.Group>
                    <Button disabled={scale === 0} onClick={decreaseScale}><MinusOutlined /></Button>
                    <Button disabled={scale === MAX_SCALE} onClick={increaseScale}><PlusOutlined /></Button>
                </Button.Group>
            </div>
            <Document file={uri} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError} options={pdfOptions}>
                {pageArray}
            </Document>
        </div>
    );
};
PdfDisplay.propTypes = {
    uri: PropTypes.string,
    onLoad: PropTypes.func,
    onFail: PropTypes.func,
};

export default PdfDisplay;
