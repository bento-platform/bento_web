import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Form, Input, Select } from "antd";

import LocusSearch from "./LocusSearch";

import { notAlleleCharactersRegex } from "@/utils/misc";


const isValidLocus = (locus) =>
    locus.chrom !== null && locus.start !== null && locus.end !== null;
const normalizeAlleleText = (text) =>
    text.toUpperCase().replaceAll(notAlleleCharactersRegex, "");
const containsInvalid = (text) => {
    const matches = text.toUpperCase().match(notAlleleCharactersRegex);
    return matches && matches.length > 0;
};

const INITIAL_FIELDS_VALIDITY = {
    "assemblyId": true,
    "locus": true,
};

// Match style from DiscoverySearchForm
const LABEL_COL = { lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 } };
const WRAPPER_COL = { lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 } };


const VariantSearchHeader = ({ dataType, addVariantSearchValues }) => {
    const [refFormReceivedValidKeystroke, setRefFormReceivedValidKeystroke] = useState(true);
    const [altFormReceivedValidKeystroke, setAltFormReceivedValidKeystroke] = useState(true);
    const [activeRefValue, setActiveRefValue] = useState(null);
    const [activeAltValue, setActiveAltValue] = useState(null);
    const [assemblyId, setAssemblyId] = useState(null);
    const [locus, setLocus] = useState({ chrom: null, start: null, end: null });
    const isSubmitting = useSelector(state => state.explorer.isSubmittingSearch);

    // begin with required fields considered valid, so user isn't assaulted with error messages
    const [fieldsValidity, setFieldsValidity] = useState(INITIAL_FIELDS_VALIDITY);

    const variantsOverviewResults = useSelector((state) => state.explorer.variantsOverviewResponse);
    const hasAssemblyIds =
        variantsOverviewResults?.assemblyIDs !== undefined &&
        !variantsOverviewResults?.assemblyIDs.hasOwnProperty("error");
    const overviewAssemblyIds = hasAssemblyIds ? Object.keys(variantsOverviewResults?.assemblyIDs) : [];

    const assemblySchema = dataType.schema?.properties?.assembly_id;
    const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type;

    const helpText = {
        "assemblyId": assemblySchema?.description,
        "genotype": genotypeSchema?.description,
        "locus": "Enter gene name (eg \"BRCA1\") or position (\"chr17:41195311-41278381\")",
        "ref/alt": "Combination of nucleotides A, C, T, and G, including N as a wildcard - i.e. AATG, CG, TNN",
    };

    // custom validation since this form isn't submitted, it's just used to fill fields in hidden form
    // each field is validated individually elsewhere
    // for final validation, we only need to make sure required fields are non-empty
    const validateVariantSearchForm = useCallback(() => {
        // check assembly
        if (!assemblyId) {
            // change assemblyId help text & outline
            setFieldsValidity({ ...fieldsValidity, "assemblyId": false });
        }

        // check locus
        const { chrom, start, end } = locus;
        if (!chrom || !start || !end) {
            // change locus help text & outline
            setFieldsValidity({ ...fieldsValidity, "locus": false });
        }
    }, [assemblyId, locus, fieldsValidity]);

    useEffect(() => {
        if (isSubmitting) {
            validateVariantSearchForm();
        }
    }, [isSubmitting]);

    const setLocusValidity = useCallback((isValid) => {
        setFieldsValidity({ ...fieldsValidity, "locus": isValid });
    }, [fieldsValidity]);

    const handleLocusChange = useCallback((locus) => {
        setLocusValidity(isValidLocus(locus));

        // set even if invalid, so we don't keep old values
        setLocus(locus);
    }, [setLocusValidity]);

    const handleAssemblyIdChange = useCallback((value) => {
        addVariantSearchValues({ assemblyId: value });
        setAssemblyId(value);
    }, []);

    const handleGenotypeChange = useCallback((value) => {
        addVariantSearchValues({ genotypeType: value });
    }, []);

    const handleRefChange = useCallback((e) => {
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
    }, []);

    const handleAltChange = useCallback((e) => {
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
    }, []);

    // set default selected assemblyId if only 1 is present
    const shouldTriggerAssemblyIdChange = overviewAssemblyIds.length === 1;
    useEffect(() => {
        if (shouldTriggerAssemblyIdChange) {
            // wait some time before
            // triggering handleAssemblyIdChange to
            // allow for the form and formValues
            // in the parent element to populate
            setTimeout(function() {
                handleAssemblyIdChange(overviewAssemblyIds[0]);
            }, 500);
        }
    }, [shouldTriggerAssemblyIdChange]);


    return (
        <>
            <Form.Item
                labelCol={LABEL_COL}
                wrapperCol={WRAPPER_COL}
                label="Assembly ID"
                help={helpText["assemblyId"]}
                validateStatus={fieldsValidity.assemblyId ? "success" : "error"}
                required
            >
                <Select
                    onChange={handleAssemblyIdChange}
                    defaultValue={overviewAssemblyIds && shouldTriggerAssemblyIdChange && overviewAssemblyIds[0]}
                    options={overviewAssemblyIds.map((value) => ({ value, label: value }))}
                />
            </Form.Item>
            <Form.Item
                labelCol={LABEL_COL}
                wrapperCol={WRAPPER_COL}
                label="Gene / position"
                help={helpText["locus"]}
                validateStatus={fieldsValidity.locus ? "success" : "error"}
                required
            >
                <LocusSearch assemblyId={assemblyId}
                             addVariantSearchValues={addVariantSearchValues}
                             handleLocusChange={handleLocusChange}
                             setLocusValidity={setLocusValidity} />
            </Form.Item>
            <Form.Item
                labelCol={LABEL_COL}
                wrapperCol={WRAPPER_COL}
                label="Genotype"
                help={helpText["genotype"]}
            >
                <Select
                    onChange={handleGenotypeChange}
                    allowClear
                >
                    {genotypeSchema.enum.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                </Select>
            </Form.Item>
            <Form.Item
                labelCol={LABEL_COL}
                wrapperCol={WRAPPER_COL}
                label="Reference Allele"
                help={helpText["ref/alt"]}
            >
                <Input
                    onChange={handleRefChange}
                    value={activeRefValue}
                    style={{ borderColor: refFormReceivedValidKeystroke ? "" : "red" }}
                />
            </Form.Item>
            <Form.Item
                labelCol={LABEL_COL}
                wrapperCol={WRAPPER_COL}
                label="Alternate Allele"
                help={helpText["ref/alt"]}
            >
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
