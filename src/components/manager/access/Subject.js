import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Popover, Typography } from "antd";

const Subject = ({ subject, groupsByID }) => {
    const currentIDToken = useSelector((state) => state.auth.idTokenContents);

    const { sub, client, iss, group, everyone } = subject;

    if (sub || client) {
        return (
            <p style={{ margin: 0, lineHeight: "1.6em" }}>
                <strong>{sub ? "Subject" : "Client"}:</strong>{" "}
                <Typography.Text code={true}>{sub ?? client}</Typography.Text><br />
                <strong>Issuer:</strong>{" "}
                <Typography.Text code={true}>{iss}</Typography.Text><br />
                {(sub === currentIDToken?.sub && iss === currentIDToken?.iss) ? <><em>(this is you)</em></> : null}
            </p>
        );
    } else if (group) {
        const groupDef = groupsByID[group];
        // TODO: link
        if (!groupDef) return (
            <a>Group {group}</a>
        );
        return (
            <a>Group {group}: {groupDef.name}</a>
        );
    } else if (everyone) {
        return (
            <Popover content="Everyone, even anonymous users.">Everyone</Popover>
        );
    }

    // Base case
    return (
        <pre>{stringifyJSONRenderIfMultiKey(subject)}</pre>
    );
};
Subject.propTypes = {
    // Combinations: sub+iss, client+iss, group, everyone
    sub: PropTypes.string,
    client: PropTypes.string,
    iss: PropTypes.string,
    group: PropTypes.number,
    everyone: PropTypes.oneOf([true]),
};

export default Subject;
