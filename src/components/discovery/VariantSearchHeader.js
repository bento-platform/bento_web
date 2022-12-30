import React, { useState } from "react";
import { Input, Form, Select } from "antd";
import PropTypes from "prop-types";
import LocusSearch from "./LocusSearch";
import {useSelector} from "react-redux";

import { notAlleleCharactersRegex } from "../../utils/misc";

const VariantSearchHeader = ({dataType, addVariantSearchValues}) => {

  // or default to GRCh37?
    const [lookupAssemblyId, setLookupAssemblyId] = useState(null);
    const assemblySchema = dataType.schema?.properties?.assembly_id;
    const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type;

  // hardcoded style from DiscoverySearchForm, change to params
    const labelCol = {lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 }};
    const wrapperCol = {lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 }};

    // obtain ref and alt values from state
    const firstDatasetDatatypeForm = useSelector(state => state.explorer?.dataTypeFormsByDatasetID[Object.keys(state.explorer.dataTypeFormsByDatasetID)[0]]);
    const activeRefValue = firstDatasetDatatypeForm[0].formValues?.conditions == undefined ? "" : firstDatasetDatatypeForm[0].formValues.conditions.filter(c => c.value.field == '[dataset item].reference')[0].value.searchValue
    const activeAltValue = firstDatasetDatatypeForm[0].formValues?.conditions == undefined ? "" : firstDatasetDatatypeForm[0].formValues.conditions.filter(c => c.value.field == '[dataset item].alternative')[0].value.searchValue
    const handleAssemblyIdChange = (value) => {

        addVariantSearchValues({assemblyId: value});

    // temp workaround for bug in Bento back end:
    // files ingested with GRCh37 reference need to be searched using assemblyId "Other"

    // so if assembly is "Other", pass that value to the form, but use
    // "GRCh37" as the reference for gene lookup in Gohan
        if (value === "Other") {
            setLookupAssemblyId("GRCh37");
            return;
        }

        setLookupAssemblyId(value);
    };

    const handleGenotypeChange = (value) => {
        addVariantSearchValues({genotypeType: value});
    };

    const handleRefChange = (e) => {
      addVariantSearchValues({ref: validateAlleleText(e.target.value)});
    };
    const handleAltChange = (e) => {
      addVariantSearchValues({alt: validateAlleleText(e.target.value)});
    };
    const validateAlleleText = (text) => {
      return text.toUpperCase().replaceAll(notAlleleCharactersRegex, '');
    }

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
      >
       {assemblySchema.enum.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
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
      <Input onChange={handleRefChange} value={activeRefValue} />
    </Form.Item>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Alternate Allele"}
      help={"Combination of nucleotides A, C, T, and G, including N as a wildcard - i.e. AATG, CG, TNN"}
    >
      <Input onChange={handleAltChange} value={activeAltValue} />
    </Form.Item>
    </>
    );
};

VariantSearchHeader.propTypes = {
    dataType: PropTypes.object,
    addVariantSearchValues: PropTypes.func,
};

export default VariantSearchHeader;
