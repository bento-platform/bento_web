import {
  RoleValues,
  PublicationTypeValues,
  PublicationVenueTypeValues,
  ParticipantCriterionTypeValues,
  LinkTypeValues,
} from "@/types/dataset";

export type OntologyResourcePreset = {
  id: string;
  name: string;
  url: string;
  namespace_prefix: string;
  iri_prefix: string;
  repository_url?: string;
};

export const COMMON_ONTOLOGIES: Record<string, OntologyResourcePreset> = {
  EFO: {
    id: "efo",
    name: "Experimental Factor Ontology",
    namespace_prefix: "EFO",
    iri_prefix: "http://www.ebi.ac.uk/efo/EFO_",
    url: "https://www.ebi.ac.uk/efo/efo.owl",
    repository_url: "https://github.com/EBISPOT/efo",
  },
  HP: {
    id: "hp",
    name: "Human Phenotype Ontology",
    namespace_prefix: "HP",
    iri_prefix: "http://purl.obolibrary.org/obo/HP_",
    url: "https://purl.obolibrary.org/obo/hp.owl",
    repository_url: "https://github.com/obophenotype/human-phenotype-ontology",
  },
  MONDO: {
    id: "mondo",
    name: "Mondo Disease Ontology",
    namespace_prefix: "MONDO",
    iri_prefix: "http://purl.obolibrary.org/obo/MONDO_",
    url: "https://purl.obolibrary.org/obo/mondo.owl",
    repository_url: "https://github.com/monarch-initiative/mondo",
  },
  NCBITaxon: {
    id: "ncbitaxon",
    name: "NCBI organismal classification",
    namespace_prefix: "NCBITaxon",
    iri_prefix: "http://purl.obolibrary.org/obo/NCBITaxon_",
    url: "https://purl.obolibrary.org/obo/ncbitaxon.owl",
    repository_url: "https://github.com/obophenotype/ncbitaxon",
  },
  NCIT: {
    id: "ncit",
    name: "NCI Thesaurus OBO Edition",
    namespace_prefix: "NCIT",
    iri_prefix: "http://purl.obolibrary.org/obo/NCIT_",
    url: "https://purl.obolibrary.org/obo/ncit.owl",
    repository_url: "https://github.com/NCI-Thesaurus/thesaurus-obo-edition",
  },
  OBI: {
    id: "obi",
    name: "Ontology for Biomedical Investigations",
    namespace_prefix: "OBI",
    iri_prefix: "http://purl.obolibrary.org/obo/OBI_",
    url: "https://purl.obolibrary.org/obo/obi.owl",
    repository_url: "https://github.com/obi-ontology/obi",
  },
  SNOMED: {
    id: "snomed",
    name: "SNOMED Clinical Terms",
    namespace_prefix: "SNOMED",
    iri_prefix: "http://purl.bioontology.org/ontology/SNOMEDCT/",
    url: "http://purl.bioontology.org/ontology/SNOMEDCT",
  },
  SO: {
    id: "so",
    name: "Sequence types and features ontology",
    namespace_prefix: "SO",
    iri_prefix: "http://purl.obolibrary.org/obo/SO_",
    url: "https://purl.obolibrary.org/obo/so.owl",
    repository_url: "https://github.com/The-Sequence-Ontology/SO-Ontologies",
  },
  UBERON: {
    id: "uberon",
    name: "Uberon multi-species anatomy ontology",
    namespace_prefix: "UBERON",
    iri_prefix: "http://purl.obolibrary.org/obo/UBERON_",
    url: "https://purl.obolibrary.org/obo/uberon.owl",
    repository_url: "https://github.com/obophenotype/uberon",
  },
};

export type KeywordOntologyPreset = {
  id: string;
  label: string;
  category: string;
};

export const COMMON_KEYWORD_PRESETS: KeywordOntologyPreset[] = [
  // NCBITaxon — species
  { id: "NCBITaxon:9606", label: "Homo sapiens", category: "Species" },
  { id: "NCBITaxon:10090", label: "Mus musculus", category: "Species" },
  { id: "NCBITaxon:29073", label: "Ursus maritimus", category: "Species" },
  // OBI — assays
  { id: "OBI:0002763", label: "16s ribosomal gene sequencing assay", category: "Assays" },
  { id: "OBI:0002118", label: "exome sequencing assay", category: "Assays" },
  { id: "OBI:0000366", label: "metabolite profiling assay", category: "Assays" },
  { id: "OBI:0001318", label: "proteomic profiling by array assay", category: "Assays" },
  { id: "OBI:0001271", label: "RNA-seq assay", category: "Assays" },
  { id: "OBI:0002117", label: "whole genome sequencing assay", category: "Assays" },
  // OBI — specimens
  { id: "OBI:0000655", label: "blood specimen", category: "Specimens" },
  { id: "OBI:0002503", label: "feces specimen", category: "Specimens" },
  { id: "OBI:0002505", label: "milk specimen", category: "Specimens" },
  { id: "OBI:0000917", label: "nasal swab specimen", category: "Specimens" },
  { id: "OBI:0002508", label: "sputum specimen", category: "Specimens" },
  // SO
  { id: "SO:0000991", label: "genomic DNA", category: "Sequence types" },
  // UBERON
  { id: "UBERON:0000178", label: "blood", category: "Anatomy" },
  { id: "UBERON:0001988", label: "feces", category: "Anatomy" },
  { id: "UBERON:0001913", label: "milk", category: "Anatomy" },
  { id: "UBERON:0007311", label: "sputum", category: "Anatomy" },
];

export const roleOptions = RoleValues.map((r) => ({ label: r, value: r }));
export const publicationTypeOptions = PublicationTypeValues.map((t) => ({ label: t, value: t }));
export const publicationTypeSelectOptions = [...publicationTypeOptions, { value: "__other", label: "Other (specify)" }];
export const venueTypeOptions = PublicationVenueTypeValues.map((t) => ({ label: t, value: t }));
export const venueTypeSelectOptions = [...venueTypeOptions, { value: "__other", label: "Other (specify below)" }];
export const criterionTypeOptions = ParticipantCriterionTypeValues.map((t) => ({ label: t, value: t }));
export const linkTypeOptions = LinkTypeValues.map((t) => ({ label: t, value: t }));
