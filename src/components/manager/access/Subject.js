import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import { Popover, Typography } from "antd";

import { stringifyJSONRenderIfMultiKey } from "./utils";

const Subject = ({ subject, groupsByID }) => {
    const currentIDToken = useSelector((state) => state.auth.idTokenContents);

    const { sub, client, iss, group, everyone } = subject;

    /*
    There are four possible configurations of a subject:
     - { iss: "<issuer>", sub: "<subject>" } (1)
     - { iss: "<issuer>", client: "<client ID>" } (2)
     - { group: "<group ID>" } --> group itself contains either an expression or a list of (1) and/or (2)
     - { everyone: true }
     */

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
        return (
            <>
                <strong>Group:</strong>{" "}
                <Link to={`/data/manager/access/groups#group-${group}`}>
                    {groupDef
                        ? (<>{groupDef.name} (ID: {group})</>)
                        : (<>ID: {group}</>)}
                </Link>
            </>
        );
    } else if (everyone) {
        return (
            <Popover content="Everyone, even anonymous users."><strong>Everyone</strong></Popover>
        );
    }

    // Base case
    return (
        <pre>{stringifyJSONRenderIfMultiKey(subject)}</pre>
    );
};
Subject.defaultProps = {
    groupsByID: {},
};
Subject.propTypes = {
    subject: PropTypes.oneOfType([
        // Combinations: sub+iss, client+iss, group, everyone
        PropTypes.shape({ sub: PropTypes.string, iss: PropTypes.string }),
        PropTypes.shape({ client: PropTypes.string, iss: PropTypes.string }),
        PropTypes.shape({ group: PropTypes.number }),
        PropTypes.shape({ everyone: PropTypes.oneOf([true]) }),
    ]),
    groupsByID: PropTypes.objectOf(PropTypes.shape({
        name: PropTypes.string,
        membership: PropTypes.oneOfType([
            PropTypes.shape({expr: PropTypes.array}),
            PropTypes.shape({
                membership: PropTypes.arrayOf(PropTypes.oneOfType([
                    // Combinations: sub+iss, client+iss
                    PropTypes.shape({ sub: PropTypes.string, iss: PropTypes.string }),
                    PropTypes.shape({ client: PropTypes.string, iss: PropTypes.string }),
                ])),
            }),
        ]),
        expiry: PropTypes.string,
        notes: PropTypes.string,
    })),
};

export default Subject;
