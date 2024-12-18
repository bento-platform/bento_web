import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import type { JSONSchema7 } from "json-schema";

import { Form, Input, Select } from "antd";

import LocusSearch from "./LocusSearch";

import type { InputChangeEventHandler } from "@/components/manager/access/types";
import { useGohanVariantsOverview } from "@/modules/explorer/hooks";
import type { BentoDataType } from "@/modules/services/types";
import { useReferenceGenomes } from "@/modules/reference/hooks";
import { useAppSelector } from "@/store";
import { notAlleleCharactersRegex } from "@/utils/misc";

type Locus = { chrom: string | null; start: string | null; end: string | null };

const isValidLocus = (locus: Locus) => locus.chrom !== null && locus.start !== null && locus.end !== null;
const normalizeAlleleText = (text: string) => text.toUpperCase().replaceAll(notAlleleCharactersRegex, "");
const containsInvalid = (text: string) => {
  const matches = text.toUpperCase().match(notAlleleCharactersRegex);
  return matches && matches.length > 0;
};

type FieldsValidity = {
  assemblyId: boolean;
  locus: boolean;
};

const INITIAL_FIELDS_VALIDITY: FieldsValidity = {
  assemblyId: true,
  locus: true,
};

// Match style from DiscoverySearchForm
const LABEL_COL = { lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 } };
const WRAPPER_COL = { lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 } };

type VariantSearchHeaderProps = {
  dataType: BentoDataType;
  addVariantSearchValues: (
    x:
      | { assemblyId: string }
      | { alt: string }
      | { ref: string }
      | {
          genotypeType: string;
        },
  ) => void;
};

const VariantSearchHeader = ({ dataType, addVariantSearchValues }: VariantSearchHeaderProps) => {
  const { data: variantsOverviewResults, isFetching: isFetchingVariantsOverview } = useGohanVariantsOverview();
  const overviewAssemblyIds = useMemo(() => {
    const hasAssemblyIds =
      variantsOverviewResults?.assemblyIDs !== undefined &&
      !variantsOverviewResults?.assemblyIDs.hasOwnProperty("error");
    return hasAssemblyIds ? Object.keys(variantsOverviewResults?.assemblyIDs) : [];
  }, [variantsOverviewResults]);
  const overviewAssemblyIdOptions = useMemo(
    () => overviewAssemblyIds.map((value) => ({ value, label: value })),
    [overviewAssemblyIds],
  );

  const [refFormReceivedValidKeystroke, setRefFormReceivedValidKeystroke] = useState(true);
  const [altFormReceivedValidKeystroke, setAltFormReceivedValidKeystroke] = useState(true);
  const [activeRefValue, setActiveRefValue] = useState<string>("");
  const [activeAltValue, setActiveAltValue] = useState<string>("");

  const [assemblyId, setAssemblyId] = useState<string | null>(
    overviewAssemblyIds.length === 1 ? overviewAssemblyIds[0] : null,
  );
  const referenceGenomes = useReferenceGenomes();
  const geneSearchEnabled = assemblyId !== null && !!referenceGenomes.itemsByID[assemblyId]?.gff3_gz;

  const [locus, setLocus] = useState<Locus>({ chrom: null, start: null, end: null });
  const { isSubmittingSearch: isSubmitting } = useAppSelector((state) => state.explorer);

  // begin with required fields considered valid, so user isn't assaulted with error messages
  const [fieldsValidity, setFieldsValidity] = useState<FieldsValidity>(INITIAL_FIELDS_VALIDITY);

  const genotypeSchema = (
    (dataType.schema?.properties?.calls as JSONSchema7 | undefined)?.items as JSONSchema7 | undefined
  )?.properties?.genotype_type as JSONSchema7 | undefined;
  const genotypeSchemaDescription = genotypeSchema?.description;
  const genotypeOptions = useMemo(
    () => ((genotypeSchema?.enum ?? []) as string[]).map((value: string) => ({ value, label: value })),
    [genotypeSchema],
  );

  const helpText = useMemo(() => {
    const assemblySchema = dataType.schema?.properties?.assembly_id as JSONSchema7 | undefined;
    return {
      assemblyId: assemblySchema?.description ?? "",
      genotype: genotypeSchemaDescription,
      // eslint-disable-next-line quotes
      locus: 'Enter gene name (e.g., "BRCA1") or position ("chr17:41195311-41278381")',
      "ref/alt": "Combination of nucleotides A, C, T, and G, including N as a wildcard - e.g., AATG, CG, TNN",
      locusPositionOnly: 'Enter position, e.g., "chr17:10000-20000"',
    };
  }, [dataType, genotypeSchemaDescription]);

  // custom validation since this form isn't submitted, it's just used to fill fields in hidden form
  // each field is validated individually elsewhere
  // for final validation, we only need to make sure required fields are non-empty
  const validateVariantSearchForm = useCallback(() => {
    // check assembly
    if (!assemblyId) {
      // change assemblyId help text & outline
      setFieldsValidity((fv) => ({ ...fv, assemblyId: false }));
    }

    // check locus
    const { chrom, start, end } = locus;
    if (!chrom || !start || !end) {
      // change locus help text & outline
      setFieldsValidity((fv) => ({ ...fv, locus: false }));
    }
  }, [assemblyId, locus]);

  useEffect(() => {
    if (isSubmitting) {
      validateVariantSearchForm();
    }
  }, [isSubmitting, validateVariantSearchForm]);

  const setLocusValidity = useCallback((isValid: boolean) => {
    setFieldsValidity((fv) => ({ ...fv, locus: isValid }));
  }, []);

  const handleLocusChange = useCallback(
    (locus: Locus) => {
      setLocusValidity(isValidLocus(locus));

      // set even if invalid, so we don't keep old values
      setLocus(locus);
    },
    [setLocusValidity],
  );

  const handleAssemblyIdChange = useCallback(
    (value: string) => {
      addVariantSearchValues({ assemblyId: value });
      setAssemblyId(value);
    },
    [addVariantSearchValues],
  );

  const handleGenotypeChange = useCallback(
    (value: string) => {
      addVariantSearchValues({ genotypeType: value });
    },
    [addVariantSearchValues],
  );

  const handleRefChange = useCallback<InputChangeEventHandler>(
    (e) => {
      const latestInputValue = e.target.value;
      const normalizedRef = normalizeAlleleText(latestInputValue);
      const didValueContainInvalidChars = containsInvalid(latestInputValue);

      if (didValueContainInvalidChars) {
        setRefFormReceivedValidKeystroke(!didValueContainInvalidChars);
        setTimeout(() => {
          setRefFormReceivedValidKeystroke(true);
        }, 1000);
      }
      setActiveRefValue(normalizedRef);
      addVariantSearchValues({ ref: normalizedRef });
    },
    [addVariantSearchValues],
  );

  const handleAltChange = useCallback<InputChangeEventHandler>(
    (e) => {
      const latestInputValue = e.target.value;
      const normalizedAlt = normalizeAlleleText(latestInputValue);
      const didValueContainInvalidChars = containsInvalid(latestInputValue);

      if (didValueContainInvalidChars) {
        setAltFormReceivedValidKeystroke(!didValueContainInvalidChars);
        setTimeout(() => {
          setAltFormReceivedValidKeystroke(true);
        }, 1000);
      }

      setActiveAltValue(normalizedAlt);
      addVariantSearchValues({ alt: normalizedAlt });
    },
    [addVariantSearchValues],
  );

  useEffect(() => {
    // set default selected assemblyId if only 1 is present
    if (overviewAssemblyIds.length === 1) {
      handleAssemblyIdChange(overviewAssemblyIds[0]);
    }
  }, [handleAssemblyIdChange, overviewAssemblyIds]);

  return (
    <>
      <Form.Item
        labelCol={LABEL_COL}
        wrapperCol={WRAPPER_COL}
        label="Assembly ID"
        help={helpText["assemblyId"]}
        validateStatus={fieldsValidity.assemblyId ? "success" : "error"}
        required={true}
      >
        <Select
          onChange={handleAssemblyIdChange}
          options={overviewAssemblyIdOptions}
          loading={isFetchingVariantsOverview}
          value={assemblyId}
        />
      </Form.Item>
      <Form.Item
        labelCol={LABEL_COL}
        wrapperCol={WRAPPER_COL}
        label={isFetchingVariantsOverview || geneSearchEnabled ? "Gene / position" : "Position"}
        help={geneSearchEnabled ? helpText["locus"] : helpText["locusPositionOnly"]}
        validateStatus={fieldsValidity.locus ? "success" : "error"}
        required
      >
        <LocusSearch
          assemblyId={assemblyId}
          geneSearchEnabled={geneSearchEnabled}
          addVariantSearchValues={addVariantSearchValues}
          handleLocusChange={handleLocusChange}
          setLocusValidity={setLocusValidity}
        />
      </Form.Item>
      <Form.Item labelCol={LABEL_COL} wrapperCol={WRAPPER_COL} label="Genotype" help={helpText["genotype"]}>
        <Select onChange={handleGenotypeChange} allowClear={true} options={genotypeOptions} />
      </Form.Item>
      <Form.Item labelCol={LABEL_COL} wrapperCol={WRAPPER_COL} label="Reference Allele" help={helpText["ref/alt"]}>
        <Input
          onChange={handleRefChange}
          value={activeRefValue}
          style={{ borderColor: refFormReceivedValidKeystroke ? "" : "red" }}
        />
      </Form.Item>
      <Form.Item labelCol={LABEL_COL} wrapperCol={WRAPPER_COL} label="Alternate Allele" help={helpText["ref/alt"]}>
        <Input
          onChange={handleAltChange}
          value={activeAltValue}
          style={{ borderColor: altFormReceivedValidKeystroke ? "" : "red" }}
        />
      </Form.Item>
    </>
  );
};

VariantSearchHeader.propTypes = {
  dataType: PropTypes.object,
  addVariantSearchValues: PropTypes.func,
};

export default VariantSearchHeader;
