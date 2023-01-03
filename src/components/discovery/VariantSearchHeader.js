import React, { useState } from "react";
import { Form, Select } from "antd";
import PropTypes from "prop-types";
import LocusSearch from "./LocusSearch";
import { useSelector } from "react-redux";

const VariantSearchHeader = ({dataType, addVariantSearchValues}) => {
    const varOvRes = useSelector((state) => state.explorer.variantsOverviewResponse);
    const ovAsmIds = varOvRes?.assemblyIDs !== undefined ? Object.keys(varOvRes?.assemblyIDs) : [];


  // or default to GRCh37?
    const [lookupAssemblyId, setLookupAssemblyId] = useState(null);
    const assemblySchema = dataType.schema?.properties?.assembly_id;
    const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type;

  // hardcoded style from DiscoverySearchForm, change to params
    const labelCol = {lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 }};
    const wrapperCol = {lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 }};

    const handleAssemblyIdChange = (value) => {

        addVariantSearchValues({assemblyId: value});
    };

    const handleGenotypeChange = (value) => {
        addVariantSearchValues({genotypeType: value});
    };

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
    </>
    );
};

VariantSearchHeader.propTypes = {
    dataType: PropTypes.object,
    addVariantSearchValues: PropTypes.func,
};

export default VariantSearchHeader;
