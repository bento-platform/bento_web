import React, { memo, useEffect } from "react";
import PropTypes from "prop-types";

import { Icon } from "antd";

import { EM_DASH } from "../../constants";
import { individualPropTypesShape, ontologyShape } from "../../propTypes";
import { id } from "../../utils/misc";

import { useResourcesByNamespacePrefix } from "./utils";

const OntologyTerm = memo(({ individual, term, renderLabel }) => {
    // TODO: perf: might be slow to generate this over and over
    const resourcesByNamespacePrefix = useResourcesByNamespacePrefix(individual);

    if (!term) {
        return (
            <>{EM_DASH}</>
        );
    }

    useEffect(() => {
        if (!term.id || !term.label) {
            console.error("Invalid term provided to OntologyTerm component:", term);
        }
    }, [term]);

    if (!term.id || !term.label) {
        return (
            <>{EM_DASH}</>
        );
    }

    /**
     * @type {string|null}
     */
    let defLink = null;

    if (term.id.includes(":")) {
        const [namespacePrefix, namespaceID] = term.id.split(":");
        const termResource = resourcesByNamespacePrefix[namespacePrefix];

        if (termResource?.iri_prefix && !termResource.iri_prefix.includes("example.org")) {
            defLink = `${termResource.iri_prefix}${namespaceID}`;
        }  // If resource doesn't exist / isn't linkable, don't include a link
    }  // Otherwise, malformed ID - render without a link

    return (
        <span>
            {renderLabel(term.label)} (ID: {term.id}){" "}
            {defLink && (
                <a href={defLink} target="_blank" rel="noopener noreferrer">
                    <Icon type="link" />
                </a>
            )}
        </span>
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
