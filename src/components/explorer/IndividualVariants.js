import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Button, Descriptions } from "antd";

import { setIgvPosition } from "../../modules/explorer/actions";
import "./explorer.css";
import JsonView from "./JsonView";
import OntologyTerm from "./OntologyTerm";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const variantStyle = {margin: "5px"};

const variantExpressionPropType = PropTypes.shape({
    syntax: PropTypes.string,
    value: PropTypes.string,
    version: PropTypes.string,
});

const VariantExpressionDetails = ({variantExpression, geneContext, tracksUrl}) => {
    const dispatch = useDispatch();
    return (
        <div style={variantStyle}>
            <span style={{display: "inline", marginRight: "15px"} }>
                <strong>syntax :</strong>{" "}{variantExpression.syntax}{" "}
                <strong>value :</strong>{" "}{variantExpression.value}{" "}
                <strong>version :</strong>{" "}{variantExpression.version}{" "}
            </span>
            {geneContext && (
                <>
                    gene context:
                    <Link onClick={() => dispatch(setIgvPosition(geneContext))}
                          to={{ pathname: tracksUrl }}>
                        <Button>{geneContext.value_id}</Button>
                    </Link>
                </>
            )}
        </div>
    );
};
VariantExpressionDetails.propTypes = {
    variantExpression: variantExpressionPropType,
    geneContext: PropTypes.object,
    tracksUrl: PropTypes.string,
};


const VariantDescriptor = ({variationDescriptor, tracksUrl}) => {
    return (
        <Descriptions layout="horizontal" bordered={true} column={1} size="small">
            <Descriptions.Item label={"ID"}>{variationDescriptor.id}</Descriptions.Item>
            {variationDescriptor.variation &&
                <Descriptions.Item label="Variation">
                    {/* TODO: VRS type specific display ?*/}
                    <JsonView inputJson={variationDescriptor.variation}/>
                </Descriptions.Item>
            }
            {variationDescriptor.label &&
                <Descriptions.Item label="Label">{variationDescriptor.label}</Descriptions.Item>
            }
            {variationDescriptor.description &&
                <Descriptions.Item label="Description">{variationDescriptor.description}</Descriptions.Item>
            }
            {variationDescriptor.gene_context &&
                <Descriptions.Item label="Gene Context">
                    <JsonView inputJson={variationDescriptor.gene_context}/>
                </Descriptions.Item>
            }
            {(variationDescriptor.expressions && variationDescriptor.gene_context) &&
                <Descriptions.Item label={"Expressions"}>
                    {variationDescriptor.expressions.map(expr => (
                        <VariantExpressionDetails variantExpression={expr}
                                                  geneContext={variationDescriptor.gene_context}
                                                  tracksUrl={tracksUrl}
                                                  key={expr.value}/>
                    ))}
                </Descriptions.Item>
            }
            {variationDescriptor.vfc_record &&
                <Descriptions.Item label={"VCF Record"}>
                    <JsonView inputJson={variationDescriptor.vfc_record}/>
                </Descriptions.Item>
            }
            {variationDescriptor.xrefs &&
                <Descriptions.Item label={"XRefs"}>{variationDescriptor.xrefs}</Descriptions.Item>
            }
            {variationDescriptor.alternate_labels &&
                <Descriptions.Item label={"Alternate Labels"}>{variationDescriptor.alternate_labels}</Descriptions.Item>
            }
            {variationDescriptor.extensions &&
                <Descriptions.Item label={"Extensions"}>
                    {variationDescriptor.extensions}
                </Descriptions.Item>
            }
            {variationDescriptor.molecule_context &&
                <Descriptions.Item label={"Molecule Context"}>{variationDescriptor.molecule_context}</Descriptions.Item>
            }
            {variationDescriptor.structural_type &&
                <Descriptions.Item label={"Structural Type"}>
                    <OntologyTerm term={variationDescriptor.structural_type}/>
                </Descriptions.Item>
            }
            {variationDescriptor.vrs_ref_allele_seq &&
                <Descriptions.Item label={"VRS ref allele sequence"}>
                    {variationDescriptor.vrs_ref_allele_seq}
                </Descriptions.Item>
            }
            {variationDescriptor.allelic_state &&
                <Descriptions.Item label={"Allelic State"}>
                    <OntologyTerm term={variationDescriptor.allelic_state}/>
                </Descriptions.Item>
            }
        </Descriptions>
    );
};
VariantDescriptor.propTypes = {
    variationDescriptor: PropTypes.object,
    tracksUrl: PropTypes.string,
};

export default VariantDescriptor;
