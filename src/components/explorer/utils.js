import { useEffect, useMemo } from "react";
import { fetchDatasetResourcesIfNecessary } from "@/modules/datasets/actions";
import { useAppDispatch, useAppSelector } from "@/store";
import { guessFileType } from "@/utils/files";

// --- CONSTANTS ---
export const ALIGNMENT_FORMATS_LOWER = ["bam", "cram"];
export const ANNOTATION_FORMATS_LOWER = ["bigbed"];
export const MUTATION_FORMATS_LOWER = ["maf"];
export const WIG_FORMATS_LOWER = ["bigwig"];
export const VARIANT_FORMATS_LOWER = ["vcf", "gvcf"];

export const IGV_VIEWABLE_FORMATS_LOWER = [
  ...ALIGNMENT_FORMATS_LOWER,
  ...ANNOTATION_FORMATS_LOWER,
  ...MUTATION_FORMATS_LOWER,
  ...WIG_FORMATS_LOWER,
  ...VARIANT_FORMATS_LOWER,
];

// --- HELPER FUNCTIONS ---

export const expResFileFormatLower = (expRes) => expRes.file_format?.toLowerCase() ?? guessFileType(expRes.filename);

// For an experiment result to be viewable in IGV.js, it must have:
//  - an assembly ID, so we can contextualize it correctly
//  - a file format in the list of file formats we know how to handle
export const isViewableInIgv = (expRes) =>
  !!expRes.genome_assembly_id && IGV_VIEWABLE_FORMATS_LOWER.includes(expResFileFormatLower(expRes));

export const expResFileFormatToIgvTypeAndFormat = (fileFormat) => {
  const ff = fileFormat.toLowerCase();

  if (ALIGNMENT_FORMATS_LOWER.includes(ff)) return ["alignment", ff];
  if (ANNOTATION_FORMATS_LOWER.includes(ff)) return ["annotation", "bigBed"]; // TODO: experiment result: support more
  if (MUTATION_FORMATS_LOWER.includes(ff)) return ["mut", ff];
  if (WIG_FORMATS_LOWER.includes(ff)) return ["wig", "bigWig"]; // TODO: expand if we support wig/bedGraph
  if (VARIANT_FORMATS_LOWER.includes(ff)) return ["variant", "vcf"];

  return [undefined, undefined];
};

// --- HOOKS ---

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
  const dispatch = useAppDispatch();

  const datasetResources = useAppSelector((state) => state.datasetResources.itemsByID);

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

export const explorerIndividualUrl = (individualID) => `/data/explorer/individuals/${individualID}`;

export const useIndividualIgvViewableExperimentResults = (individual) => {
  const biosamplesData = useDeduplicatedIndividualBiosamples(individual);
  return useMemo(() => {
    const experiments = biosamplesData.flatMap((b) => b?.experiments ?? []);

    const uniqueResults = Object.values(
      Object.fromEntries(experiments.flatMap((e) => e?.experiment_results ?? []).map((r) => [r.id, r])),
    );

    const vr = uniqueResults.filter(isViewableInIgv).map((expRes) => {
      const fileFormatLower = expResFileFormatLower(expRes);
      return { ...expRes, fileFormatLower };
    });

    return vr;
  }, [biosamplesData]);
};
