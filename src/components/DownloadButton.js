import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button } from "antd";

import { AUDIO_FILE_EXTENSIONS, IMAGE_FILE_EXTENSIONS, VIDEO_FILE_EXTENSIONS } from "./display/FileDisplay";

const BROWSER_RENDERED_EXTENSIONS = [
    ".pdf",
    ".txt",
    ...AUDIO_FILE_EXTENSIONS,
    ...IMAGE_FILE_EXTENSIONS,
    ...VIDEO_FILE_EXTENSIONS,
];

const DownloadButton = ({ disabled, uri, fileName, children, size, type, onClick: propsOnClick, ...props }) => {
    const { accessToken } = useSelector((state) => state.auth);

    const onClick = useCallback((e) => {
        if (!uri) return;

        const form = document.createElement("form");
        if (fileName && BROWSER_RENDERED_EXTENSIONS.find((ext) => fileName.toLowerCase().endsWith(ext))) {
            // In Firefox, if we open, e.g., a PDF; it'll open in the PDF viewer instead of downloading.
            // Here, we force it to open in a new tab if it's render-able by the browser (although Chrome will actually
            // download the PDF file, so it'll flash a new tab - this is a compromise solution for viewable file types.)
            form.target = "_blank";
        }
        form.method = "post";
        form.action = uri;
        form.innerHTML = `<input type="hidden" name="token" value="${accessToken}" />`;
        document.body.appendChild(form);
        try {
            form.submit();
        } finally {
            // Even if submit raises for some reason, we still need to clean this up; it has a token in it!
            document.body.removeChild(form);

            // Call the props-passed onClick event handler after hijacking the event and doing our own thing
            if (propsOnClick) propsOnClick(e);
        }
    }, [uri, accessToken, propsOnClick]);

    return (
        <Button key="download" icon="download" size={size} type={type} disabled={disabled} onClick={onClick} {...props}>
            {children === undefined ? "Download" : children}
        </Button>
    );
};

DownloadButton.defaultProps = {
    disabled: false,
    size: "default",
    type: "default",
};

DownloadButton.propTypes = {
    disabled: PropTypes.bool,
    uri: PropTypes.string,
    fileName: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    size: PropTypes.oneOf(["small", "default", "large"]),
    type: PropTypes.oneOf(["primary", "ghost", "dashed", "danger", "link", "default"]),
    onClick: PropTypes.func,
};

export default DownloadButton;
