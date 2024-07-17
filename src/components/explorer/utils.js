import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDatasetResourcesIfNecessary } from "@/modules/datasets/actions";
import { EM_DASH } from "@/constants";

export const useDeduplicatedIndividualBiosamples = (individual) =>
  useMemo(
    () =>
      Object.values(
        Object.fromEntries((individual?.phenopackets ?? []).flatMap((p) => p.biosamples).map((b) => [b.id, b])),
      ),
    [individual],
  );

export const useIndividualInterpretations = (individual, withDiagnosis = false) =>
  useMemo(
    () =>
      Object.values(
        Object.fromEntries(
          (individual?.phenopackets ?? [])
            .flatMap((p) => p.interpretations)
            .filter((i) => (withDiagnosis ? i.hasOwnProperty("diagnosis") : true))
            .filter(Boolean)
            .map((i) => [i.id, i]),
        ),
      ),
    [individual, withDiagnosis],
  );

/**
 * Hook to evaluate if the fieldName of an object/array contains data
 * @param {array | object} data
 * @param {string} fieldName
 * @returns A bool value, true if "fieldName" is empty
 */
export const useIsDataEmpty = (data, fieldName) => {
  return useMemo(() => {
    if (Array.isArray(data)) {
      // Flatmap the field if data is an array,
      // e.g: data is a list of biosamples, with fieldName="experiments"
      return data.flatMap((item) => item[fieldName] ?? []).length === 0;
    }

    // Check data[fieldName] directly if data is an object
    return (data[fieldName] ?? []).length === 0;
  }, [data, fieldName]);
};

/**
 * Returns the Interpretations that contain the call
 * @param {array} interpretations Array of Phenopacket Interpretation
 * @param {string} call "gene_descriptor" or "variant_interpretation"
 * @returns List of GenomicInterpretations filtered for variants or genes call
 */
const useGenomicInterpretationsWithCall = (interpretations, call) =>
  useMemo(
    () =>
      Object.values(
        Object.fromEntries(
          interpretations
            .filter((interp) => interp.hasOwnProperty("diagnosis"))
            .filter(
              (interp) =>
                interp.diagnosis.hasOwnProperty("genomic_interpretations") &&
                interp.diagnosis.genomic_interpretations.length,
            )
            .flatMap((interp) => interp.diagnosis.genomic_interpretations)
            .filter((gi) => gi.hasOwnProperty(call))
            .map((gi) => [gi.subject_or_biosample_id, gi]),
        ),
      ),
    [interpretations, call],
  );

export const useIndividualVariantInterpretations = (individual) => {
  const interpretations = useIndividualInterpretations(individual);
  return useGenomicInterpretationsWithCall(interpretations, "variant_interpretation");
};

export const useIndividualGeneDescriptors = (individual) => {
  const interpretations = useIndividualInterpretations(individual);
  return useGenomicInterpretationsWithCall(interpretations, "gene_descriptor");
};

export const useDatasetResources = (datasetIDOrDatasetIDs) => {
  const dispatch = useDispatch();

  const datasetResources = useSelector((state) => state.datasetResources.itemsByID);

  const datasetIDs = useMemo(
    () => (Array.isArray(datasetIDOrDatasetIDs) ? datasetIDOrDatasetIDs : [datasetIDOrDatasetIDs]),
    [datasetIDOrDatasetIDs],
  );

  useEffect(() => {
    datasetIDs.map((d) => dispatch(fetchDatasetResourcesIfNecessary(d)));
  }, [dispatch, datasetIDs]);

  return useMemo(() => {
    const r = Object.values(
      Object.fromEntries(datasetIDs.flatMap((d) => datasetResources[d]?.data ?? []).map((r) => [r.id, r])),
    );
    const fetching = datasetIDs.reduce((flag, d) => flag || datasetResources[d]?.isFetching, false);
    return [r, fetching];
  }, [datasetResources, datasetIDs]);
};

export const useIndividualResources = (individual) => {
  // TODO: when individual belongs to a single dataset, use that instead
  const individualDatasets = useMemo(() => (individual?.phenopackets ?? []).map((p) => p.dataset), [individual]);

  return useDatasetResources(individualDatasets);
};

export const useResourcesByNamespacePrefix = ([resources, isFetching]) => {
  return useMemo(
    () => [Object.fromEntries(resources.map((r) => [r.namespace_prefix, r])), isFetching],
    [resources, isFetching],
  );
};

export const useIndividualPhenopacketDataIndex = (individual, fieldName) => {
  return useMemo(
    () =>
      (individual?.phenopackets ?? [])
        .flatMap((p) => p?.[fieldName] ?? [])
        .map((element, index) => ({ ...element, idx: `${index}` })),
    [individual, fieldName],
  );
};

export const ontologyTermSorter = (k) => (a, b) => {
  if (a[k]?.label && b[k]?.label) {
    return a[k].label.toString().localeCompare(b[k].label.toString());
  }
  return 0;
};

export const booleanFieldSorter = (k) => (a, b) => {
  const aVal = a[k];
  const bVal = b[k];
  if (typeof aVal === "boolean" && typeof bVal === "boolean") {
    return aVal - bVal;
  }
  return 0;
};

export const renderBoolean = (k) => (_, record) => {
  const value = record[k];
  if (typeof value === "boolean") {
    return String(value);
  }
  return EM_DASH;
};

export const explorerIndividualUrl = (individualID) => `/data/explorer/individuals/${individualID}`;
