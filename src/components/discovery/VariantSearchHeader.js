import React, { useState, useEffect } from "react";
import { Input, Form, Select } from "antd";
import PropTypes from "prop-types";
import LocusSearch from "./LocusSearch";
import { useSelector } from "react-redux";

import { notAlleleCharactersRegex } from "../../utils/misc";

const VariantSearchHeader = ({dataType, addVariantSearchValues}) => {
    const [refFormReceivedValidKeystroke, setRefFormReceivedValidKeystroke ] = useState(true);
    const [altFormReceivedValidKeystroke , setAltFormReceivedValidKeystroke ] = useState(true);
    const [activeRefValue, setActiveRefValue] = useState(null);
    const [activeAltValue, setActiveAltValue] = useState(null);
    const [assemblyId, setAssemblyId] = useState(null);
    const [locus, setLocus] = useState({chrom: null, start: null, end: null});
    const isSubmitting = useSelector(state => state.explorer.isSubmittingSearch);

    // begin with required fields considered valid, so user isn't assaulted with error messages
    const initialValidity = {
        "assemblyId": true,
        "locus": true,
    };

    const [fieldsValidity, setFieldsValidity] = useState(initialValidity);

    const variantsOverviewResults = useSelector((state) => state.explorer.variantsOverviewResponse);
    const hasAssemblyIds =
        variantsOverviewResults?.assemblyIDs !== undefined &&
        !variantsOverviewResults?.assemblyIDs.hasOwnProperty("error");
    const overviewAssemblyIds = hasAssemblyIds ? Object.keys(variantsOverviewResults?.assemblyIDs) : [];

    const assemblySchema = dataType.schema?.properties?.assembly_id;
    const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type;

  // hardcoded style from DiscoverySearchForm, change to params
    const labelCol = {lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 }};
    const wrapperCol = {lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 }};

    const helpText = {
        "assemblyId": assemblySchema?.description,
        "genotype": genotypeSchema?.description,
        "locus": "Enter gene name (eg \"BRCA1\") or position (\"chr17:41195311-41278381\")",
        "ref/alt": "Combination of nucleotides A, C, T, and G, including N as a wildcard - i.e. AATG, CG, TNN"
    };

    // custom validation since this form isn't submitted, it's just used to fill fields in hidden form
    // each field is validated invididually elsewhere
    // for final validation, we only need to make sure required fields are non-empty
    const validateVariantSearchForm = () => {

      // check assembly
        if (!assemblyId) {
        // change assemblyId helptext & outline
            setFieldsValidity({...fieldsValidity, "assemblyId": false});
        }

        // check locus
        const {chrom, start, end} = locus;
        if (!chrom || !start || !end) {
        // change locus helptext & outline
            setFieldsValidity({...fieldsValidity, "locus": false});
        }
    };

    useEffect(() => {
        if (isSubmitting) {
            validateVariantSearchForm();
        }
    }, [isSubmitting]);


    const isValidLocus = (locus) => {
        return locus.chrom !== null  && locus.start !== null && locus.end !== null;
    };

    const setLocusValidity = (isValid) => {
        setFieldsValidity({...fieldsValidity, "locus": isValid});
    };

    const handleLocusChange = (locus) => {
        setLocusValidity(isValidLocus(locus));

        // set even if invalid so we don't keep old values
        setLocus(locus);
    };

    const handleAssemblyIdChange = (value) => {
        addVariantSearchValues({assemblyId: value});
        setAssemblyId(value);
    };

    const handleGenotypeChange = (value) => {
        addVariantSearchValues({genotypeType: value});
    };

    const handleRefChange = (e) => {
        const latestInputValue = e.target.value;
        const validatedRef = validateAlleleText(latestInputValue);
        const didValueContainInvalidChars = containsInvalid(latestInputValue);

        if (didValueContainInvalidChars) {
            setRefFormReceivedValidKeystroke(!didValueContainInvalidChars);
            setTimeout(function() {
                setRefFormReceivedValidKeystroke(true);
            }, 1000);
        }
        setActiveRefValue(validatedRef);
        addVariantSearchValues({ref: validatedRef});
    };

    const handleAltChange = (e) => {
        const latestInputValue = e.target.value;
        const validatedAlt = validateAlleleText(latestInputValue);
        const didValueContainInvalidChars = containsInvalid(latestInputValue);

        if (didValueContainInvalidChars) {
            setAltFormReceivedValidKeystroke(!didValueContainInvalidChars);
            setTimeout(function() {
                setAltFormReceivedValidKeystroke(true);
            }, 1000);
        }

        setActiveAltValue(validatedAlt);
        addVariantSearchValues({alt: validatedAlt});
    };

    const validateAlleleText = (text) => {
        return text.toUpperCase().replaceAll(notAlleleCharactersRegex, "");
    };
    const containsInvalid = (text) => {
        const matches = text.toUpperCase().match(notAlleleCharactersRegex);
        if (matches && matches.length > 0) {
            return true;
        }
        return false;
    };

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


    return (<>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Assembly ID"}
      help={helpText["assemblyId"]}
      validateStatus={fieldsValidity.assemblyId ? "success" : "error"}
      required
    >
      <Select
        onChange={handleAssemblyIdChange}
        defaultValue={overviewAssemblyIds && shouldTriggerAssemblyIdChange && overviewAssemblyIds[0]}
      >
       {overviewAssemblyIds.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
      </Select>
    </Form.Item>
    <Form.Item
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        label={"Gene / position"}
        help={helpText["locus"]}
        validateStatus={fieldsValidity.locus ? "success" : "error"}
        required
    >
      <LocusSearch assemblyId={assemblyId}
                   addVariantSearchValues={addVariantSearchValues}
                   handleLocusChange={handleLocusChange}
                   setLocusValidity={setLocusValidity}/>
    </Form.Item>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Genotype"}
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
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Reference Allele"}
      help={helpText["ref/alt"]}
    >
      <Input
        onChange={handleRefChange}
        value={activeRefValue} style={{
            borderColor: refFormReceivedValidKeystroke ? "" : "red"
        }} />
    </Form.Item>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Alternate Allele"}
      help={helpText["ref/alt"]}
    >
      <Input
        onChange={handleAltChange}
        value={activeAltValue} style={{
            borderColor: altFormReceivedValidKeystroke ? "" : "red"
        }} />
    </Form.Item>
    </>
    );
};

VariantSearchHeader.propTypes = {
    dataType: PropTypes.object,
    addVariantSearchValues: PropTypes.func,
};

export default VariantSearchHeader;
