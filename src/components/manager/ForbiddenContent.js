import React from "react";
import { Layout, Result } from "antd";
import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";
import PropTypes from "prop-types";

const ForbiddenContent = ({ message }) => {
    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Result status="error" title="Forbidden" subTitle={message} />
            </Layout.Content>
        </Layout>
    );
};

ForbiddenContent.propTypes = {
    message: PropTypes.string,
};

ForbiddenContent.defaultProps = {
    message: "You do not have permission to view this content.",
};

export default ForbiddenContent;
