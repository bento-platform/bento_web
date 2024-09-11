import type { DropBoxEntry } from "@/modules/dropBox/types";

export const sortByName = (a: DropBoxEntry, b: DropBoxEntry) => a.name.localeCompare(b.name);
