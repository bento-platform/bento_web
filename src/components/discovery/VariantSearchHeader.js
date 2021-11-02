import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Form, Select } from "antd";
import DiscoverySearchCondition from "./DiscoverySearchCondition";
import LocusSearch from "./LocusSearch";

const VariantSearchHeader = ({dataType, setVariantSearchValues}) => {


  // default to GRCh37
  const [assemblyId, setAssemblyId] = useState("GRCh37")

  const assemblySchema = dataType.schema?.properties?.assembly_id
  const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type
  console.log({assemblySchema:assemblySchema, genotypeSchema: genotypeSchema})

  // hardcoded style from DiscoverySearchForm, change to params
  const labelCol = {lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 }}
  const wrapperCol = {lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 }}


  const handleAssemblyIdChange = (value) => {
    // temp: treat "Other" as equivalent to GRCh37
    // requires fixes elsewhere in Bento
    if (value==="Other"){
      value = "GRCh37"
    }

    setAssemblyId(value)
    console.log(`assembly change: ${value}`)
  }

// Select needs
// style
// onChange
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
        label={"Locus"}
        help={`Enter gene name (eg "BRCA1") or position ("chr17:41195311-41278381")`}
    >
      <LocusSearch assemblyId={assemblyId}/>
    </Form.Item>
    <Form.Item
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      label={"Genotype"}
      help={genotypeSchema.description}
    >
      <Select>
       {genotypeSchema.enum.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
      </Select>
    </Form.Item>
    </>
  );
};

export default VariantSearchHeader;
