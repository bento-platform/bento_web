/**
 * TypeScript equivalent of dataset.py Pydantic models.
 * Uses Zod for runtime validation, mirroring all constraints from the Python source.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Non-empty string — equivalent to Field(min_length=1) */
const nonEmptyString = z.string().min(1);

/** ISO 8601 date string (YYYY-MM-DD) — equivalent to Python `date` */
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected ISO date (YYYY-MM-DD)");

/** UUID string — equivalent to Python `UUID` */
const uuidString = z.uuid();

/** URL string — equivalent to HttpUrl / AnyUrl */
const urlString = z.url().refine((val) => /^https?:\/\//i.test(val), "Must start with http:// or https://");

/** Any URL string — equivalent to AnyUrl (no scheme restriction) */
const anyUrlString = z.url();

/** ORCID identifier string */
const orcidString = z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, "Expected ORCID format");

/**
 * Enum matched case-insensitively and normalized to its canonical casing —
 * equivalent to TranslatedLiteral(..., case_insensitive=True) (English values only)
 */
const caseInsensitiveEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (typeof v === "string" ? (values.find((c) => c.toLowerCase() === v.toLowerCase()) ?? v) : v),
    z.enum(values),
  );

// ---------------------------------------------------------------------------
// Translated Literal enums
// ---------------------------------------------------------------------------

export const RoleValues = [
  // Leadership / oversight
  "Principal Investigator",
  "Co-Investigator",
  "Sub-Investigator",
  "Study Director",
  "Project Lead",
  "Project Manager",
  "Contact Person",
  // Research team
  "Researcher",
  "Research Assistant",
  "Data Scientist",
  "Statistician",
  "Study Coordinator",
  "Lab Technician",
  // Participants / human subjects
  "Participant",
  "Subject",
  "Volunteer",
  // Other individual roles
  "Editor",
  "Translator",
  // Organizational / institutional roles
  "Principal Laboratory",
  "Sponsoring Organization",
  "Collaborating Laboratory",
  "Collaborating Organization",
  "Consortium",
  "Distributor",
  "Institution",
  "Hosting Institution",
  "Site",
  "Research Center",
  "Research Group",
  "Publisher",
  // Ethics & compliance
  "IRB",
  "Ethics Board",
  "Data Monitoring Committee",
  "Compliance Officer",
  // Funding & support
  "Sponsor",
  "Funder",
  "Grant Agency",
  // Publications
  "Author",
  "Corresponding Author",
  // Contributors (non-research)
  "Consultant",
  "Advisor",
  "Reviewer",
  // Data & technical roles
  "Data Collector",
  "Data Provider",
  "Data Controller",
  "Data Processor",
  "Data Contributor",
  "Data Custodian",
  "Data Manager",
  "Data Producer",
  // External stakeholders
  "Partner",
  "Stakeholder",
  "Community Representative",
  "Other",
] as const;

export const Role = z.enum(RoleValues);
export type Role = z.infer<typeof Role>;

export const PublicationTypeValues = [
  // Articles and papers
  "Journal Article",
  "Conference Paper",
  "Workshop Paper",
  "Short Paper",
  "Poster",
  "Preprint",
  // Books and long form
  "Book",
  "Book Chapter",
  "Monograph",
  // Reports and gray literature
  "Technical Report",
  "White Paper",
  "Working Paper",
  // Academic qualifications
  "Thesis",
  "Master's Thesis",
  "Doctoral Dissertation",
  // Data and software
  "Dataset",
  "Software",
  "Software Paper",
  // Multimedia
  "Audio",
  "Documentary",
  "Podcast",
  "Video",
  // Reviews and other
  "Survey",
  "Review Article",
  "Editorial",
  "Commentary",
  "Patent",
] as const;

export const PublicationType = z.enum(PublicationTypeValues);
export type PublicationType = z.infer<typeof PublicationType>;

export const PublicationVenueTypeValues = [
  "Journal",
  "Conference",
  "Workshop",
  "Repository",
  "Publisher",
  "University",
  "Data Repository",
  "Preprint Repository",
] as const;

export const PublicationVenueType = z.enum(PublicationVenueTypeValues);
export type PublicationVenueType = z.infer<typeof PublicationVenueType>;

export const ParticipantCriterionTypeValues = ["Inclusion", "Exclusion", "Other"] as const;

export const ParticipantCriterionType = z.enum(ParticipantCriterionTypeValues);
export type ParticipantCriterionType = z.infer<typeof ParticipantCriterionType>;

export const LinkTypeValues = [
  "Downloadable Artifact",
  "Data Management Plan",
  "Schema",
  "External Reference",
  "Data Access",
  "Data Request Form",
] as const;

export const LinkType = z.enum(LinkTypeValues);
export type LinkType = z.infer<typeof LinkType>;

export const StudyStatusValues = ["Ongoing", "Completed"] as const;

export const StudyStatus = caseInsensitiveEnum(StudyStatusValues);
export type StudyStatus = z.infer<typeof StudyStatus>;

export const StudyContextValues = ["Clinical", "Research"] as const;

export const StudyContext = caseInsensitiveEnum(StudyContextValues);
export type StudyContext = z.infer<typeof StudyContext>;

// ---------------------------------------------------------------------------
// Shared sub-models from bento_lib (OntologyClass, VersionedOntologyResource)
// ---------------------------------------------------------------------------

/** Equivalent to bento_lib.ontologies.models.NC_NAME_PATTERN — valid CURIE prefix */
export const NC_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9.\-_]*$/;

/** Equivalent to bento_lib.ontologies.models.CURIE_PATTERN */
export const CURIE_PATTERN = /^[a-zA-Z_][a-zA-Z0-9.\-_]*:[a-zA-Z0-9.\-_]+$/;

/** Equivalent to bento_lib.ontologies.models.OntologyClass */
export const OntologyClass = z.object({
  id: z.string().regex(CURIE_PATTERN, "Expected a CURIE, e.g. NCBITaxon:9606"),
  label: z.string(),
});
export type OntologyClass = z.infer<typeof OntologyClass>;

/** Equivalent to bento_lib.ontologies.models.VersionedOntologyResource */
export const VersionedOntologyResource = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  url: urlString,
  namespace_prefix: z.string().regex(NC_NAME_PATTERN, "Expected a valid CURIE prefix, e.g. NCBITaxon"),
  iri_prefix: urlString,
  version: nonEmptyString,
  repository_url: urlString.nullable().optional(),
});
export type VersionedOntologyResource = z.infer<typeof VersionedOntologyResource>;

// ---------------------------------------------------------------------------
// Other — fallback when a literal is not exhaustive
// ---------------------------------------------------------------------------

/** Equivalent to class Other(BaseModel): other: str */
export const Other = z.object({
  other: nonEmptyString,
});
export type Other = z.infer<typeof Other>;

// ---------------------------------------------------------------------------
// Phone
// ---------------------------------------------------------------------------

export const Phone = z.object({
  country_code: z.number().int(),
  number: z.number().int(),
  extension: z.number().int().nullable().optional(),
});
export type Phone = z.infer<typeof Phone>;

// ---------------------------------------------------------------------------
// Contact  (at least one field required)
// ---------------------------------------------------------------------------

export const Contact = z
  .object({
    website: urlString.nullable().optional(),
    email: z.array(z.email()).min(1).nullable().optional(),
    address: nonEmptyString.nullable().optional(),
    phone: Phone.nullable().optional(),
  })
  .refine(
    (c) =>
      (c.website !== null && c.website !== undefined) ||
      (c.email !== null && c.email !== undefined) ||
      (c.address !== null && c.address !== undefined) ||
      (c.phone !== null && c.phone !== undefined),
    {
      message: "Contact must have at least one field (website, email, address, or phone)",
    },
  );
export type Contact = z.infer<typeof Contact>;

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export const Organization = z.object({
  type: z.literal("organization"),
  name: nonEmptyString,
  description: nonEmptyString.nullable().optional(),
  contact: Contact.nullable().optional(),
  location: nonEmptyString.nullable().optional(),
  roles: z.array(Role).min(1),
});
export type Organization = z.infer<typeof Organization>;

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

export const Person = z.object({
  type: z.literal("person"),
  name: nonEmptyString,
  honorific: nonEmptyString.nullable().optional(),
  /** Alternative names such as maiden names, nicknames, or transliterations */
  other_names: z.array(nonEmptyString).min(1).nullable().optional(),
  affiliations: z
    .array(z.union([Organization, nonEmptyString]))
    .min(1)
    .nullable()
    .optional(),
  contact: Contact.nullable().optional(),
  location: nonEmptyString.nullable().optional(),
  orcid: orcidString.nullable().optional(),
  /** Role(s) this individual holds in relation to the work (required for stakeholders) */
  roles: z.array(Role).default([]),
});
export type Person = z.infer<typeof Person>;

// ---------------------------------------------------------------------------
// PersonOrOrganization  (discriminated union on `type`)
// ---------------------------------------------------------------------------

export const PersonOrOrganization = z.discriminatedUnion("type", [Person, Organization]);
export type PersonOrOrganization = z.infer<typeof PersonOrOrganization>;

// ---------------------------------------------------------------------------
// ParticipantCriteria
// ---------------------------------------------------------------------------

export const ParticipantCriteria = z.object({
  link: urlString.nullable().optional(),
  type: ParticipantCriterionType,
  description: nonEmptyString,
});
export type ParticipantCriteria = z.infer<typeof ParticipantCriteria>;

// ---------------------------------------------------------------------------
// Count
// ---------------------------------------------------------------------------

export const Count = z.object({
  count_entity: nonEmptyString,
  /** Coerced to number — equivalent to BeforeValidator(float) */
  value: z.coerce.number(),
  description: nonEmptyString,
});
export type Count = z.infer<typeof Count>;

// ---------------------------------------------------------------------------
// License  (derived from DCAT)
// ---------------------------------------------------------------------------

export const License = z.object({
  label: nonEmptyString,
  type: nonEmptyString,
  url: urlString,
});
export type License = z.infer<typeof License>;

// ---------------------------------------------------------------------------
// PublicationVenue
// ---------------------------------------------------------------------------

export const PublicationVenue = z.object({
  name: nonEmptyString,
  /** Known venue type or a free-text fallback */
  venue_type: z.union([PublicationVenueType, Other]),
  url: urlString.nullable().optional(),
  publisher: nonEmptyString.nullable().optional(),
  location: nonEmptyString.nullable().optional(),
});
export type PublicationVenue = z.infer<typeof PublicationVenue>;

// ---------------------------------------------------------------------------
// Publication
// ---------------------------------------------------------------------------

export const Publication = z.object({
  title: nonEmptyString,
  url: urlString,
  doi: nonEmptyString.nullable().optional(),
  /** Known publication type or a free-text fallback */
  publication_type: z.union([PublicationType, Other]),
  authors: z.array(PersonOrOrganization).min(1).nullable().optional(),
  publication_date: dateString.nullable().optional(),
  publication_venue: PublicationVenue.nullable().optional(),
  description: nonEmptyString.nullable().optional(),
});
export type Publication = z.infer<typeof Publication>;

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

export const Logo = z.object({
  url: anyUrlString,
  theme: z.enum(["light", "dark", "default"]).default("default"),
  description: nonEmptyString.nullable().optional(),
  /** Whether the logo contains branding text to the left or right of the logo image */
  contains_text: z.boolean().default(false),
});
export type Logo = z.infer<typeof Logo>;

// ---------------------------------------------------------------------------
// SpatialCoverage (GeoJSON Feature)
// ---------------------------------------------------------------------------

export const SpatialCoverageProperties = z.object({ name: nonEmptyString }).passthrough(); // ConfigDict(extra="allow")
export type SpatialCoverageProperties = z.infer<typeof SpatialCoverageProperties>;

/**
 * GeoJSON Feature for spatial coverage with mandatory name in properties.
 * Mirrors geojson_pydantic.Feature with typed properties.
 */
export const SpatialCoverageFeature = z.object({
  type: z.literal("Feature"),
  geometry: z.record(z.string(), z.unknown()).nullable(), // GeoJSON Geometry object or null
  properties: SpatialCoverageProperties,
  id: z.union([z.string(), z.number()]).optional(),
  bbox: z.array(z.number()).optional(),
});
export type SpatialCoverageFeature = z.infer<typeof SpatialCoverageFeature>;

// ---------------------------------------------------------------------------
// Link / TypedLink
// ---------------------------------------------------------------------------

/** A labeled URL link */
export const Link = z.object({
  label: nonEmptyString,
  url: anyUrlString,
});
export type Link = z.infer<typeof Link>;

/** Related links to the dataset that are useful to reference in metadata */
export const TypedLink = Link.extend({
  type: z.union([LinkType, Other]),
});
export type TypedLink = z.infer<typeof TypedLink>;

// ---------------------------------------------------------------------------
// FundingSource
// ---------------------------------------------------------------------------

export const FundingSource = z
  .object({
    funder: z.union([nonEmptyString, PersonOrOrganization]).nullable().optional(),
    grant_numbers: z.array(z.string()).min(1).nullable().optional(),
  })
  .refine(
    (fs) =>
      (fs.funder !== null && fs.funder !== undefined) || (fs.grant_numbers !== null && fs.grant_numbers !== undefined),
    { message: "FundingSource must have at least one of funder / grant number(s)" },
  );
export type FundingSource = z.infer<typeof FundingSource>;

// ---------------------------------------------------------------------------
// LongDescription
// ---------------------------------------------------------------------------

export const LongDescription = z.object({
  content: nonEmptyString,
  content_type: z.enum(["text/html", "text/markdown", "text/plain"]),
});
export type LongDescription = z.infer<typeof LongDescription>;

// ---------------------------------------------------------------------------
// DatasetModelBase
// ---------------------------------------------------------------------------

/** ISO 639-1 two-letter language code */
const languageAlpha2 = z.string().regex(/^[a-z]{2}$/, "Expected ISO 639-1 two-letter language code (e.g. en)");

export const DatasetModelBase = z
  .object({
    schema_version: z.literal("1.0"),
    language: languageAlpha2.default("en"),

    title: nonEmptyString,
    description: nonEmptyString,
    long_description: LongDescription.nullable().optional(),
    taxa: z
      .array(z.union([OntologyClass, z.string()]))
      .min(1)
      .nullable()
      .optional(),

    keywords: z
      .array(z.union([z.string(), OntologyClass]))
      .min(1)
      .nullable()
      .optional(),
    /** Ontology resources needed to resolve CURIEs in keywords and clinical/phenotypic data */
    resources: z.array(VersionedOntologyResource).min(1).nullable().optional(),
    stakeholders: z.array(PersonOrOrganization).min(1).nullable().optional(),
    funding_sources: z
      .union([z.array(z.union([FundingSource, Link])), nonEmptyString])
      .nullable()
      .optional(),

    spatial_coverage: z.union([nonEmptyString, SpatialCoverageFeature]).nullable().optional(),
    version: nonEmptyString.nullable().optional(),
    privacy: nonEmptyString.nullable().optional(),
    license: License.nullable().optional(),
    counts: z.array(Count).min(1).nullable().optional(),
    primary_contact: PersonOrOrganization,
    links: z.array(Link).min(1).nullable().optional(),
    publications: z.array(Publication).min(1).nullable().optional(),
    logos: z.array(Logo).min(1).nullable().optional(),
    release_date: dateString.nullable().optional(),
    last_modified: dateString.nullable().optional(),
    participant_criteria: z.array(ParticipantCriteria).min(1).nullable().optional(),

    study_status: StudyStatus.nullable().optional(),
    study_context: StudyContext.nullable().optional(),

    /** List of specific scientific or clinical domains addressed by the study */
    domain: z.array(nonEmptyString).min(1).nullable().optional(),
    /** The overarching program the study belongs to (if applicable) */
    program_name: nonEmptyString.nullable().optional(),

    /** Unique identifier of the Data Access Committee (DAC) in PCGL to which the study is assigned */
    pcgl_dac_id: nonEmptyString.nullable().optional(),

    /** Dataset-level discovery configuration; falls back to project/instance config if not set */
    discovery: z.record(z.string(), z.unknown()).nullable().optional(),

    /** Additional custom metadata properties not covered by the standard schema */
    extra_properties: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]).nullable())
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Equivalent to check_keyword_resources model_validator
    const resourcePrefixes = new Set(data.resources?.map((r) => r.namespace_prefix) ?? []);

    const ontologyPrefix = (id: string) => id.split(":")[0];

    if (data.keywords) {
      const missing = [
        ...new Set(
          data.keywords
            .filter((kw): kw is OntologyClass => typeof kw === "object" && "id" in kw)
            .map((kw) => ontologyPrefix(kw.id))
            .filter((prefix) => !resourcePrefixes.has(prefix)),
        ),
      ].sort();
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `keywords contain OntologyClass CURIEs with no matching resource: ${JSON.stringify(missing)}`,
        });
      }
    }

    if (data.taxa) {
      const missing = [
        ...new Set(
          data.taxa
            .filter((t): t is OntologyClass => typeof t === "object" && "id" in t)
            .map((t) => ontologyPrefix(t.id))
            .filter((prefix) => !resourcePrefixes.has(prefix)),
        ),
      ].sort();
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `taxa contains OntologyClass CURIEs with no matching resource: ${JSON.stringify(missing)}`,
        });
      }
    }

    if (data.stakeholders) {
      const missingRoles = data.stakeholders
        .filter((s): s is Person => s.type === "person" && s.roles.length === 0)
        .map((s) => s.name);
      if (missingRoles.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `stakeholder persons must have at least one role: ${JSON.stringify(missingRoles)}`,
        });
      }
    }
  });

export type DatasetModelBase = z.infer<typeof DatasetModelBase>;

// ---------------------------------------------------------------------------
// DatasetModel  (adds `identifier`)
// ---------------------------------------------------------------------------

export const DatasetModel = DatasetModelBase.and(
  z.object({
    /** If from PCGL, directly inherited; otherwise created in katsu */
    identifier: z.string().min(1).max(128),
  }),
);
export type DatasetModel = z.infer<typeof DatasetModel>;

// ---------------------------------------------------------------------------
// ProjectScopedDatasetModel  (adds `project` UUID)
// ---------------------------------------------------------------------------

export const ProjectScopedDatasetModel = DatasetModel.and(
  z.object({
    project: uuidString,
  }),
);
export type ProjectScopedDatasetModel = z.infer<typeof ProjectScopedDatasetModel>;
