import React, { useCallback, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useAuthorizationHeader } from "../../lib/auth/utils";
import PropTypes from "prop-types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

const BASE_PDF_OPTIONS = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
};

/** @type {Object.<string, React.CSSProperties>} */
const styles = {
    container: {
        position: "relative",
    },
};

const PdfDisplay = ({uri, onLoad, onFail}) => {
    const authHeader = useAuthorizationHeader();

    const [pdfPageCounts, setPdfPageCounts] = useState({});

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

    return (
        <div style={styles.container}>
            <Document file={uri} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError} options={pdfOptions}>
                {(() => {
                    const pages = [];
                    for (let i = 1; i <= pdfPageCounts[uri] ?? 1; i++) {
                        pages.push(<Page pageNumber={i} key={i} />);
                    }
                    return pages;
                })()}
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
