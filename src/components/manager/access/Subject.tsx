import React from "react";
import { Link } from "react-router-dom";

import { Popover, Typography } from "antd";
import { useAuthState } from "bento-auth-js";

import { useGroupsByID } from "@/modules/authz/hooks";
import { GrantSubject } from "@/modules/authz/types";
import { stringifyJSONRenderIfMultiKey } from "./utils";

export type SubjectProps = {
    subject: GrantSubject;
};

const Subject = ({ subject }: SubjectProps) => {
    const { idTokenContents: currentIDToken } = useAuthState();

    const groupsByID = useGroupsByID();

    /*
    There are four possible configurations of a subject:
     - { iss: "<issuer>", sub: "<subject>" } (1)
     - { iss: "<issuer>", client: "<client ID>" } (2)
     - { group: <group ID> } --> group itself contains either an expression or a list of (1) and/or (2)
     - { everyone: true }
     */

    if ("iss" in subject) {
        const { iss } = subject;
        const isSub = "sub" in subject;
        return (
            <p style={{ margin: 0, lineHeight: "1.6em" }}>
                <strong>{isSub ? "Subject" : "Client"}:</strong>{" "}
                <Typography.Text code={true}>{isSub ? subject.sub : subject.client}</Typography.Text><br />
                <strong>Issuer:</strong>{" "}
                <Typography.Text code={true}>{iss}</Typography.Text><br />
                {(isSub && subject.sub === currentIDToken?.sub && iss === currentIDToken?.iss)
                    ? <em>(this is you)</em>
                    : null}
            </p>
        );
    } else if ("group" in subject) {
        const { group } = subject;
        const groupDef = groupsByID[subject.group];
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
    } else if ("everyone" in subject) {
        return (
            <Popover content="Everyone, even anonymous users."><strong>Everyone</strong></Popover>
        );
    }

    // Base case
    return (
        <pre>{stringifyJSONRenderIfMultiKey(subject)}</pre>
    );
};

export default Subject;
