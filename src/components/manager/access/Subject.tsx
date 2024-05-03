import React from "react";
import { Link } from "react-router-dom";

import { Popover, Typography } from "antd";
import { useAuthState } from "bento-auth-js";

import { useGroupsByID } from "@/modules/authz/hooks";
import type { GrantSubject, StoredGroup } from "@/modules/authz/types";
import { stringifyJSONRenderIfMultiKey } from "./utils";

export type SubjectProps = {
    subject: GrantSubject;
    boldLabel?: boolean;
};

const Subject = ({ subject, boldLabel }: SubjectProps) => {
    const { idTokenContents: currentIDToken } = useAuthState();

    const groupsByID: Record<number, StoredGroup> = useGroupsByID();

    const renderAsBold = boldLabel ?? true;  // default to true
    const labelStyle = { fontWeight: renderAsBold ? "bold" : "normal" };

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
                <span style={labelStyle}>{isSub ? "Subject" : "Client"}:</span>{" "}
                <Typography.Text code={true}>{isSub ? subject.sub : subject.client}</Typography.Text><br />
                <span style={labelStyle}>Issuer:</span>{" "}
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
                <span style={labelStyle}>Group:</span>{" "}
                <Link to={`/data/manager/access/groups#group-${group}`}>
                    {groupDef
                        ? (<>{groupDef.name} (ID: {group})</>)
                        : (<>ID: {group}</>)}
                </Link>
            </>
        );
    } else if ("everyone" in subject) {
        return (
            <Popover content="Everyone, even anonymous users."><span style={labelStyle}>Everyone</span></Popover>
        );
    }

    // Base case
    return (
        <pre>{stringifyJSONRenderIfMultiKey(subject)}</pre>
    );
};

export default Subject;
