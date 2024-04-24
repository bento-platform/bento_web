import React from "react";
import { Link } from "react-router-dom";

import { Popover, Typography } from "antd";
import { useAuthState } from "bento-auth-js";

import { GrantSubject, StoredGroup } from "@/types/authz";
import { stringifyJSONRenderIfMultiKey } from "./utils";

export type SubjectProps = {
    subject: GrantSubject;
    groupsByID: Record<number, StoredGroup>;
};

const Subject = ({ subject, groupsByID }: SubjectProps) => {
    const { idTokenContents: currentIDToken } = useAuthState();

    const { sub, client, iss, group, everyone } = subject;

    /*
    There are four possible configurations of a subject:
     - { iss: "<issuer>", sub: "<subject>" } (1)
     - { iss: "<issuer>", client: "<client ID>" } (2)
     - { group: <group ID> } --> group itself contains either an expression or a list of (1) and/or (2)
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

export default Subject;
