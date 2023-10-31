import { useSelector } from "react-redux";
import React, { useCallback } from "react";
import { Button } from "antd";
import PropTypes from "prop-types";

const DownloadButton = ({ disabled, uri, children, size, type, ...props }) => {
    const { accessToken } = useSelector((state) => state.auth);

    const onClick = useCallback(() => {
        if (!uri) return;

        const form = document.createElement("form");
        form.method = "post";
        form.action = uri;
        form.innerHTML = `<input type="hidden" name="token" value="${accessToken}" />`;
        document.body.appendChild(form);
        try {
            form.submit();
        } finally {
            // Even if submit raises for some reason, we still need to clean this up; it has a token in it!
            document.body.removeChild(form);
        }
    }, [uri, accessToken]);

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
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    size: PropTypes.oneOf(["small", "default", "large"]),
    type: PropTypes.oneOf(["primary", "ghost", "dashed", "danger", "link", "default"]),
};

export default DownloadButton;
