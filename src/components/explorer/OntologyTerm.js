import React, { memo } from "react";
import PropTypes from "prop-types";

import { EM_DASH } from "../../constants";
import { individualPropTypesShape, ontologyShape } from "../../propTypes";
import { id } from "../../utils/misc";

import { useResourcesByNamespacePrefix } from "./utils";

const OntologyTerm = memo(({ individual, term, renderLabel }) => {
    // TODO: perf: might be slow to generate this over and over
    const resourcesByNamespacePrefix = useResourcesByNamespacePrefix(individual);

    if (!term) return <>{EM_DASH}</>;

    const [namespacePrefix, namespaceID] = term.id.split(":");

    const termResource = resourcesByNamespacePrefix[namespacePrefix];

    // If resource doesn't exist / isn't linkable, render the term as an un-clickable plain <span>
    if (!termResource || !termResource.iri_prefix || termResource.iri_prefix.includes("example.org")) {
        return (
            <span>{renderLabel(term.label)} (ID: {term.id})</span>
        );
    }

    return (
        <a href={`${termResource.iri_prefix}${namespaceID}`} target="_blank" rel="noopener noreferrer">
            {renderLabel(term.label)} (ID: {term.id})
        </a>
    );
});

OntologyTerm.propTypes = {
    individual: individualPropTypesShape,
    term: ontologyShape.isRequired,
    renderLabel: PropTypes.func,
};
OntologyTerm.defaultProps = {
    renderLabel: id,
};

export default OntologyTerm;
