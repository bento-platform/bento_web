import { OntologyTerm } from "@/types/ontology";

export type Contig = {
    name: string;
    aliases: string[];
    md5: string;
    ga4gh: string;
    length: number;
    circular: boolean;
    refget_uris: string[];
};

export type Genome = {
    id: string;
    aliases: string[];
    md5: string;
    ga4gh: string;
    fasta: string;
    fai: string;
    taxon: OntologyTerm;
    contigs: Contig[];
    uri: string;
};
