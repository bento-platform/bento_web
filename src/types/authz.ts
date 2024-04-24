import type { Resource } from "bento-auth-js";
export type { Resource } from "bento-auth-js";

export type SpecificSubject = {
    everyone: undefined;
    iss: string;
    client: undefined;
    sub: string;
    group: undefined;
} | {
    everyone: undefined;
    iss: string;
    client: string;
    sub: undefined;
    group: undefined;
};

export type GrantSubject =
    | { everyone: true; iss: undefined; client: undefined; sub: undefined; group: undefined; }
    | SpecificSubject
    | { everyone: undefined; iss: undefined; client: undefined; sub: undefined; group: number };

export interface Grant {
    subject: GrantSubject;
    resource: Resource;
    expiry: string | null;
    notes: string;
    permissions: string[];  // TODO: specific strings
}

export interface StoredGrant extends Grant {
    id: number;
    created: string;
}

export type GroupMembership = { expr: Array<string | number> } | { members: SpecificSubject[] };

export interface Group {
    name: string;
    membership: GroupMembership;
    expiry: string;
    notes: string;
}

export interface StoredGroup extends Group {
    id: number;
    created: string;
}
