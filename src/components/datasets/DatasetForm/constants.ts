import {
  RoleValues,
  PublicationTypeValues,
  PublicationVenueTypeValues,
  ParticipantCriterionTypeValues,
  LinkTypeValues,
} from "@/types/dataset";

export const roleOptions = RoleValues.map((r) => ({ label: r, value: r }));
export const publicationTypeOptions = PublicationTypeValues.map((t) => ({ label: t, value: t }));
export const venueTypeOptions = PublicationVenueTypeValues.map((t) => ({ label: t, value: t }));
export const criterionTypeOptions = ParticipantCriterionTypeValues.map((t) => ({ label: t, value: t }));
export const linkTypeOptions = LinkTypeValues.map((t) => ({ label: t, value: t }));
