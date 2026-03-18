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
const uuidString = z.string().uuid();

/** URL string — equivalent to HttpUrl / AnyUrl */
const urlString = z.string().url();

// ---------------------------------------------------------------------------
// Translated Literal enums
// ---------------------------------------------------------------------------

// Leadership / oversight
export const RoleValues = [
  "Principal Investigator",
  "Co-Investigator",
  "Sub-Investigator",
  "Study Director",
  "Project Lead",
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
  // Organizational / institutional roles
  "Sponsoring Organization",
  "Collaborating Organization",
  "Consortium",
  "Institution",
  "Site",
  "Research Center",
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
  // Contributors (non-research)
  "Consultant",
  "Advisor",
  "Reviewer",
  // Data & technical roles
  "Data Provider",
  "Data Controller",
  "Data Processor",
  "Data Contributor",
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
] as const;

export const PublicationVenueType = z.enum(PublicationVenueTypeValues);
export type PublicationVenueType = z.infer<typeof PublicationVenueType>;

export const ParticipantCriterionTypeValues = [
  "Inclusion",
  "Exclusion",
  "Other",
] as const;

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

// ---------------------------------------------------------------------------
// Shared sub-models from bento_lib (OntologyClass, VersionedOntologyResource)
// ---------------------------------------------------------------------------

/**
 * Equivalent to bento_lib.ontologies.models.OntologyClass
 * Minimal shape — extend if the real schema differs.
 */
export const OntologyClass = z.object({
  id: nonEmptyString, // e.g. "HP:0001234"
  label: nonEmptyString.optional(),
});
export type OntologyClass = z.infer<typeof OntologyClass>;

/**
 * Equivalent to bento_lib.ontologies.models.VersionedOntologyResource
 * Minimal shape — extend if the real schema differs.
 */
export const VersionedOntologyResource = z.object({
  namespace_prefix: nonEmptyString, // e.g. "HP"
  url: urlString.optional(),
  version: nonEmptyString.optional(),
  name: nonEmptyString.optional(),
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
    email: z.array(z.string().email()).min(1).nullable().optional(),
    address: nonEmptyString.nullable().optional(),
    phone: Phone.nullable().optional(),
  })
  .refine(
    (c) =>
      c.website != null || c.email != null || c.address != null || c.phone != null,
    {
      message: "Contact must have at least one field (website, email, address, or phone)",
    }
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
  affiliations: z.array(z.union([Organization, nonEmptyString])).min(1).nullable().optional(),
  contact: Contact.nullable().optional(),
  location: nonEmptyString.nullable().optional(),
  roles: z.array(Role).min(1),
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
  url: urlString,
  theme: z.enum(["light", "dark", "default"]).default("default"),
  description: nonEmptyString.nullable().optional(),
  /** Whether the logo contains branding text to the left or right of the logo image */
  contains_text: z.boolean().default(false),
});
export type Logo = z.infer<typeof Logo>;

// ---------------------------------------------------------------------------
// SpatialCoverage (GeoJSON Feature)
// ---------------------------------------------------------------------------

export const SpatialCoverageProperties = z
  .object({ name: nonEmptyString })
  .passthrough(); // ConfigDict(extra="allow")
export type SpatialCoverageProperties = z.infer<typeof SpatialCoverageProperties>;

/**
 * GeoJSON Feature for spatial coverage with mandatory name in properties.
 * Mirrors geojson_pydantic.Feature with typed properties.
 */
export const SpatialCoverageFeature = z.object({
  type: z.literal("Feature"),
  geometry: z.record(z.unknown()).nullable(), // GeoJSON Geometry object or null
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
  url: urlString,
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

export const FundingSource = z.object({
  funder: z.union([nonEmptyString, PersonOrOrganization]).nullable().optional(),
  grant_numbers: z.array(nonEmptyString).min(1).nullable().optional(),
});
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

export const DatasetModelBase = z
  .object({
    schema_version: z.literal("1.0"),

    title: nonEmptyString,
    description: nonEmptyString,
    long_description: LongDescription.nullable().optional(),
    taxonomy: z.array(z.union([OntologyClass, nonEmptyString])).nullable().optional(),

    keywords: z.array(z.union([nonEmptyString, OntologyClass])).min(1).nullable().optional(),
    /** Ontology resources needed to resolve CURIEs in keywords and clinical/phenotypic data */
    resources: z.array(VersionedOntologyResource).min(1).nullable().optional(),
    stakeholders: z.array(PersonOrOrganization).min(1),
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
    links: z.array(Link).min(1),
    publications: z.array(Publication).min(1).nullable().optional(),
    logos: z.array(Logo).min(1).nullable().optional(),
    release_date: dateString.nullable().optional(),
    last_modified: dateString.nullable().optional(),
    participant_criteria: z.array(ParticipantCriteria).min(1).nullable().optional(),

    study_status: z.enum(["ONGOING", "COMPLETED"]).nullable().optional(),
    study_context: z.enum(["CLINICAL", "RESEARCH"]).nullable().optional(),

    /** List of specific scientific or clinical domains addressed by the study */
    pcgl_domain: z.array(nonEmptyString).min(1).nullable().optional(),
    /** The overarching program the study belongs to (if applicable) */
    pcgl_program_name: nonEmptyString.nullable().optional(),

    /** Additional custom metadata properties not covered by the standard schema */
    extra_properties: z
      .record(z.union([z.string(), z.number(), z.boolean()]).nullable())
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Equivalent to check_keyword_resources model_validator
    const resourcePrefixes = new Set(
      data.resources?.map((r) => r.namespace_prefix) ?? []
    );

    const ontologyPrefix = (id: string) => id.split(":")[0];

    if (data.keywords) {
      const missing = [
        ...new Set(
          data.keywords
            .filter((kw): kw is OntologyClass => typeof kw === "object" && "id" in kw)
            .map((kw) => ontologyPrefix(kw.id))
            .filter((prefix) => !resourcePrefixes.has(prefix))
        ),
      ].sort();
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `keywords contain OntologyClass CURIEs with no matching resource: ${JSON.stringify(missing)}`,
        });
      }
    }

    if (data.taxonomy) {
      const missing = [
        ...new Set(
          data.taxonomy
            .filter((t): t is OntologyClass => typeof t === "object" && "id" in t)
            .map((t) => ontologyPrefix(t.id))
            .filter((prefix) => !resourcePrefixes.has(prefix))
        ),
      ].sort();
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `taxonomy contains OntologyClass CURIEs with no matching resource: ${JSON.stringify(missing)}`,
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
  })
);
export type DatasetModel = z.infer<typeof DatasetModel>;

// ---------------------------------------------------------------------------
// ProjectScopedDatasetModel  (adds `project` UUID)
// ---------------------------------------------------------------------------

export const ProjectScopedDatasetModel = DatasetModel.and(
  z.object({
    project: uuidString,
  })
);
export type ProjectScopedDatasetModel = z.infer<typeof ProjectScopedDatasetModel>;