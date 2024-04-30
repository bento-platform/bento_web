import type { Resource } from "bento-auth-js";
export type { Resource } from "bento-auth-js";


export type PermissionDefinition = {
    id: string;
    verb: string;
    noun: string;
    min_level_required: "instance" | "project" | "dataset";
    gives: string[];
};


export type SpecificSubject = {
    iss: string;
    sub: string;
} | {
    iss: string;
    client: string;
};

export type GrantSubject =
    | { everyone: true }
    | SpecificSubject
    | { group: number };

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
