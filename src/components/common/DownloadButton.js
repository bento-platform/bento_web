import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import { useAccessToken } from "bento-auth-js";

import { AUDIO_FILE_EXTENSIONS, IMAGE_FILE_EXTENSIONS, VIDEO_FILE_EXTENSIONS } from "../display/FileDisplay";

const BROWSER_RENDERED_EXTENSIONS = [
    ".pdf",
    ".txt",
    ...AUDIO_FILE_EXTENSIONS,
    ...IMAGE_FILE_EXTENSIONS,
    ...VIDEO_FILE_EXTENSIONS,
];

const FORM_ALLOWED_EXTRA_KEYS = new Set([
    "path",  // Used by RunOutputs to download specific WES run artifacts
]);

const DownloadButton = ({
    disabled,
    uri,
    fileName,
    extraFormData,
    children,
    size,
    type,
    onClick: propsOnClick,
    ...props
}) => {
    const accessToken = useAccessToken();

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

        const tokenInput = document.createElement("input");
        tokenInput.setAttribute("type", "hidden");
        tokenInput.setAttribute("name", "token");
        tokenInput.setAttribute("value", accessToken);
        form.appendChild(tokenInput);

        Object.entries(extraFormData ?? {})
            .filter(([k, _]) => FORM_ALLOWED_EXTRA_KEYS.has(k))  // Only allowed extra keys
            .forEach(([k, v]) => {
                const extraInput = document.createElement("input");
                extraInput.setAttribute("type", "hidden");
                extraInput.setAttribute("name", k);
                extraInput.setAttribute("value", v.toString());
                form.appendChild(extraInput);
            });

        document.body.appendChild(form);

        try {
            form.submit();
        } finally {
            // Even if submit raises for some reason, we still need to clean this up; it has a token in it!
            document.body.removeChild(form);

            // Call the props-passed onClick event handler after hijacking the event and doing our own thing
            if (propsOnClick) propsOnClick(e);
        }
    }, [uri, accessToken, extraFormData, fileName, propsOnClick]);

    return (
        <Button key="download"
                icon={<DownloadOutlined />}
                size={size}
                type={type}
                disabled={disabled}
                onClick={onClick}
                {...props}>
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
    extraFormData: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    size: PropTypes.oneOf(["small", "default", "large"]),
    type: PropTypes.oneOf(["primary", "ghost", "dashed", "danger", "link", "default"]),
    onClick: PropTypes.func,
};

export default DownloadButton;
