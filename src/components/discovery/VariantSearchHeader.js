import React, { useState, useEffect } from "react";
import { Input, Form, Select } from "antd";
import PropTypes from "prop-types";
import LocusSearch from "./LocusSearch";
import { useSelector } from "react-redux";

import { notAlleleCharactersRegex } from "../../utils/misc";

const VariantSearchHeader = ({dataType, addVariantSearchValues}) => {
  // local state
  // Declare a state variable and a function to update it
    const [refFormReceivedValidKeystroke, setRefFormReceivedValidKeystroke ] = useState(true);
    const [altFormReceivedValidKeystroke , setAltFormReceivedValidKeystroke ] = useState(true);


  // global state vars
    const varOvRes = useSelector((state) => state.explorer.variantsOverviewResponse);
    const ovAsmIds = varOvRes?.assemblyIDs !== undefined ? Object.keys(varOvRes?.assemblyIDs) : [];


  // or default to GRCh37?
    const [lookupAssemblyId, setLookupAssemblyId] = useState(null);
    const assemblySchema = dataType.schema?.properties?.assembly_id;
    const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type;

  // hardcoded style from DiscoverySearchForm, change to params
    const labelCol = {lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 }};
    const wrapperCol = {lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 }};

    // obtain ref and alt values from state
    const form = useSelector(state =>
        state.explorer?.dataTypeFormsByDatasetID[Object.keys(state.explorer.dataTypeFormsByDatasetID)[0]]);
    const variantForm = form.filter(x => {
          if (x.dataType?.id === 'variant'){
            return x;
          }
        })
    let activeRefValue = "";
    let activeAltValue = "";
    if (variantForm && variantForm.length > 0) {
      activeRefValue = variantForm[0].formValues?.conditions === undefined ? "" : variantForm[0].formValues.conditions.filter(c =>
          c.value.field === "[dataset item].reference"
      )[0].value.searchValue;
      activeAltValue = variantForm[0].formValues?.conditions === undefined ? "" : variantForm[0].formValues.conditions.filter(c =>
          c.value.field === "[dataset item].alternative"
      )[0].value.searchValue;
    }
    const handleAssemblyIdChange = (value) => {

        addVariantSearchValues({assemblyId: value});
        setLookupAssemblyId(value);
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
    const shouldTriggerAssemblyIdChange = ovAsmIds.length === 1;
    useEffect(() => {
        if (shouldTriggerAssemblyIdChange) {
            // wait some time before
            // triggering handleAssemblyIdChange to
            // allow for the form and formValues
            // in the parent element to populate
            setTimeout(function() {
                handleAssemblyIdChange(ovAsmIds[0]);
            }, 500);
        }
    }, [shouldTriggerAssemblyIdChange]);

// Select needs
// style
// getSearchValue ??

    return (<>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Assembly ID"}
      help={assemblySchema.description}
    >
      <Select
        onChange={handleAssemblyIdChange}
        defaultValue={ovAsmIds && shouldTriggerAssemblyIdChange && ovAsmIds[0]}
      >
       {ovAsmIds.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
      </Select>
    </Form.Item>
    <Form.Item
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        label={"Gene / position"}
        help={"Enter gene name (eg \"BRCA1\") or position (\"chr17:41195311-41278381\")"}
    >
      <LocusSearch assemblyId={lookupAssemblyId} addVariantSearchValues={addVariantSearchValues} />
    </Form.Item>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Genotype"}
      help={genotypeSchema.description}
    >
      <Select
        onChange={handleGenotypeChange}
      >
       {genotypeSchema.enum.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
      </Select>
    </Form.Item>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Reference Allele"}
      help={"Combination of nucleotides A, C, T, and G, including N as a wildcard - i.e. AATG, CG, TNN"}
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
      help={"Combination of nucleotides A, C, T, and G, including N as a wildcard - i.e. AATG, CG, TNN"}
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
