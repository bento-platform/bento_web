import PropTypes from "prop-types";

import { Descriptions } from "antd";

import "./explorer.css";

import JsonView from "@/components/common/JsonView";
import OntologyTerm from "./OntologyTerm";
import { GeneDescriptor } from "./IndividualGenes";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const variantStyle = { margin: "5px" };

const variantExpressionPropType = PropTypes.shape({
  syntax: PropTypes.string,
  value: PropTypes.string,
  version: PropTypes.string,
});

const VariantExpressionDetails = ({ variantExpression }) => {
  return (
    <div style={variantStyle}>
      <span style={{ display: "inline" }}>
        <strong>syntax:</strong> {variantExpression.syntax}
        <br />
        <strong>value:</strong> {variantExpression.value}
        <br />
        <strong>version:</strong> {variantExpression.version}
        <br />
      </span>
    </div>
  );
};
VariantExpressionDetails.propTypes = {
  variantExpression: variantExpressionPropType,
  geneContext: PropTypes.object,
};

const VariantDescriptor = ({ variationDescriptor }) => {
  return (
    <Descriptions layout="horizontal" bordered={true} column={1} size="small">
      <Descriptions.Item label={"ID"}>{variationDescriptor.id}</Descriptions.Item>
      {variationDescriptor.variation && (
        <Descriptions.Item label="Variation">
          {/* TODO: VRS type specific display ?*/}
          <JsonView src={variationDescriptor.variation} />
        </Descriptions.Item>
      )}
      {variationDescriptor.label && <Descriptions.Item label="Label">{variationDescriptor.label}</Descriptions.Item>}
      {variationDescriptor.description && (
        <Descriptions.Item label="Description">{variationDescriptor.description}</Descriptions.Item>
      )}
      {variationDescriptor.gene_context && (
        <Descriptions.Item label="Gene Context">
          <GeneDescriptor geneDescriptor={variationDescriptor.gene_context} />
        </Descriptions.Item>
      )}
      {variationDescriptor.expressions && variationDescriptor.gene_context && (
        <Descriptions.Item label={"Expressions"}>
          {variationDescriptor.expressions.map((expr) => (
            <VariantExpressionDetails
              variantExpression={expr}
              geneContext={variationDescriptor.gene_context}
              key={expr.value}
            />
          ))}
        </Descriptions.Item>
      )}
      {variationDescriptor.vfc_record && (
        <Descriptions.Item label={"VCF Record"}>
          <JsonView src={variationDescriptor.vfc_record} />
        </Descriptions.Item>
      )}
      {variationDescriptor.xrefs && <Descriptions.Item label={"XRefs"}>{variationDescriptor.xrefs}</Descriptions.Item>}
      {variationDescriptor.alternate_labels && (
        <Descriptions.Item label={"Alternate Labels"}>{variationDescriptor.alternate_labels}</Descriptions.Item>
      )}
      {variationDescriptor.extensions && (
        <Descriptions.Item label={"Extensions"}>{variationDescriptor.extensions}</Descriptions.Item>
      )}
      {variationDescriptor.molecule_context && (
        <Descriptions.Item label={"Molecule Context"}>{variationDescriptor.molecule_context}</Descriptions.Item>
      )}
      {variationDescriptor.structural_type && (
        <Descriptions.Item label={"Structural Type"}>
          <OntologyTerm term={variationDescriptor.structural_type} />
        </Descriptions.Item>
      )}
      {variationDescriptor.vrs_ref_allele_seq && (
        <Descriptions.Item label={"VRS ref allele sequence"}>
          {variationDescriptor.vrs_ref_allele_seq}
        </Descriptions.Item>
      )}
      {variationDescriptor.allelic_state && (
        <Descriptions.Item label={"Allelic State"}>
          <OntologyTerm term={variationDescriptor.allelic_state} />
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};
VariantDescriptor.propTypes = {
  variationDescriptor: PropTypes.object,
};

export default VariantDescriptor;
