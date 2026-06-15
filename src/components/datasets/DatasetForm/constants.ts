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

// TODO: fetch COMMON_ONTOLOGY_RESOURCE_PRESETS from an endpoint instead of hardcoding
export const COMMON_ONTOLOGY_RESOURCE_PRESETS: Record<string, OntologyResourcePreset> = {
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

export type OntologyPreset = {
  id: string;
  label: string;
  category: string;
};

export const COMMON_ONTOLOGY_PRESETS: OntologyPreset[] = [
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

export type DuoCode = { id: string; shorthand: string; label: string; description: string };

export const DUO_CODES: DuoCode[] = [
  { id: "DUO:0000004", shorthand: "NRES", label: "no restriction", description: "No restriction on use." },
  { id: "DUO:0000042", shorthand: "GRU", label: "general research use", description: "Use allowed for general research use for any research purpose." },
  { id: "DUO:0000006", shorthand: "HMB", label: "health or medical or biomedical research", description: "Use allowed for health/medical/biomedical purposes; does not include the study of population origins or ancestry." },
  { id: "DUO:0000007", shorthand: "DS", label: "disease specific research", description: "Use allowed provided it is related to the specified disease." },
  { id: "DUO:0000011", shorthand: "POA", label: "population origins or ancestry research only", description: "Use limited to the study of population origins or ancestry." },
  { id: "DUO:0000012", shorthand: "RS", label: "research specific restrictions", description: "Use limited to studies of a certain research type." },
  { id: "DUO:0000015", shorthand: "NMDS", label: "no general methods research", description: "Does not allow methods development research (e.g., development of software or algorithms)." },
  { id: "DUO:0000016", shorthand: "GSO", label: "genetic studies only", description: "Use limited to genetic studies only." },
  { id: "DUO:0000018", shorthand: "NPUNCU", label: "not for profit, non commercial use only", description: "Use limited to not-for-profit organizations and not-for-profit, non-commercial use." },
  { id: "DUO:0000019", shorthand: "PUB", label: "publication required", description: "Requestor agrees to make results available to the larger scientific community." },
  { id: "DUO:0000020", shorthand: "COL", label: "collaboration required", description: "Requestor must agree to collaboration with the primary study investigator(s)." },
  { id: "DUO:0000021", shorthand: "IRB", label: "ethics approval required", description: "Requestor must provide documentation of local IRB/ERB approval." },
  { id: "DUO:0000022", shorthand: "GS", label: "geographical restriction", description: "Use limited to within a specific geographic region." },
  { id: "DUO:0000024", shorthand: "MOR", label: "publication moratorium", description: "Requestor agrees not to publish results until a specific date." },
  { id: "DUO:0000025", shorthand: "TS", label: "time limit on use", description: "Use approved for a specific number of months." },
  { id: "DUO:0000026", shorthand: "US", label: "user specific restriction", description: "Use limited to approved users." },
  { id: "DUO:0000027", shorthand: "PS", label: "project specific restriction", description: "Use limited to use within an approved project." },
  { id: "DUO:0000028", shorthand: "IS", label: "institution specific restriction", description: "Use limited to use within an approved institution." },
  { id: "DUO:0000029", shorthand: "RTN", label: "return to database or resource", description: "Requestor must return derived/enriched data to the database/resource." },
  { id: "DUO:0000043", shorthand: "CC", label: "clinical care use", description: "Use allowed for clinical use and care." },
  { id: "DUO:0000044", shorthand: "NPOA", label: "population origins or ancestry research prohibited", description: "Use for purposes of population, origin, or ancestry research is prohibited." },
  { id: "DUO:0000045", shorthand: "NPU", label: "not for profit organisation use only", description: "Use limited to not-for-profit organisations." },
  { id: "DUO:0000046", shorthand: "NCU", label: "non-commercial use only", description: "Use limited to not-for-profit use." },
];

export const duoCodeOptions = DUO_CODES.map((c) => ({
  label: `${c.shorthand} — ${c.label}`,
  value: c.id,
  title: c.description,
}));

export const roleOptions = RoleValues.map((r) => ({ label: r, value: r }));
export const publicationTypeOptions = PublicationTypeValues.map((t) => ({ label: t, value: t }));
export const publicationTypeSelectOptions = [...publicationTypeOptions, { value: "__other", label: "Other (specify)" }];
export const venueTypeOptions = PublicationVenueTypeValues.map((t) => ({ label: t, value: t }));
export const venueTypeSelectOptions = [...venueTypeOptions, { value: "__other", label: "Other (specify below)" }];
export const criterionTypeOptions = ParticipantCriterionTypeValues.map((t) => ({ label: t, value: t }));
export const linkTypeOptions = LinkTypeValues.map((t) => ({ label: t, value: t }));
