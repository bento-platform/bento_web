import React, { useState, useEffect } from "react";
import { Form, Select } from "antd";
import PropTypes from "prop-types";
import LocusSearch from "./LocusSearch";
import { useSelector } from "react-redux";

const VariantSearchHeader = ({dataType, addVariantSearchValues}) => {
  const variantsOverviewResults = useSelector((state) => state.explorer.variantsOverviewResponse);
  var overviewAssemblyIds = variantsOverviewResults?.assemblyIDs != undefined ? Object.keys(variantsOverviewResults?.assemblyIDs) : []


  // or default to GRCh37?
    const [lookupAssemblyId, setLookupAssemblyId] = useState(null);
    const assemblySchema = dataType.schema?.properties?.assembly_id;
    const genotypeSchema = dataType.schema?.properties?.calls?.items?.properties?.genotype_type;

  // hardcoded style from DiscoverySearchForm, change to params
    const labelCol = {lg: { span: 24 }, xl: { span: 4 }, xxl: { span: 3 }};
    const wrapperCol = {lg: { span: 24 }, xl: { span: 20 }, xxl: { span: 18 }};

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
       {overviewAssemblyIds.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
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
