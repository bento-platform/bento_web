import { memo, useContext, useEffect } from "react";
import PropTypes from "prop-types";

import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";

import { EM_DASH } from "@/constants";
import { ontologyShape } from "@/propTypes";
import { id } from "@/utils/misc";

import { ExplorerIndividualContext } from "./contexts/individual";
import { useResourcesByNamespacePrefix } from "./utils";

export const conditionalOntologyRender = (field) => (_, record) => {
  if (record.hasOwnProperty(field)) {
    const term = record[field];
    return <OntologyTerm term={term} />;
  }
  return EM_DASH;
};

const OntologyTerm = memo(({ term, renderLabel = id, br = false }) => {
  const { resourcesTuple } = useContext(ExplorerIndividualContext);

  // TODO: perf: might be slow to generate this over and over
  const [resourcesByNamespacePrefix, isFetchingResources] = useResourcesByNamespacePrefix(resourcesTuple);

  useEffect(() => {
    if (!term) return;
    // Skip logging for the explicit missing case {id: null, label: null}
    if (term.id === null && term.label === null) return;
    if (!term.id || !term.label) {
      console.error("Invalid term provided to OntologyTerm component:", term);
    }
  }, [term]);

  if (!term || !term.id || !term.label) {
    return <>{EM_DASH}</>;
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
    } // If resource doesn't exist / isn't linkable, don't include a link
  } // Otherwise, malformed ID - render a disabled link

  return (
    <span>
      {renderLabel(term.label)} (ID: {term.id}){" "}
      <span style={{ cursor: !defLink ? (isFetchingResources ? "wait" : "not-allowed") : "pointer" }}>
        <Button
          type="link"
          size="small"
          disabled={!defLink}
          target="_blank"
          rel="noopener noreferrer"
          href={defLink ?? "#"}
          style={{ padding: 0 }}
        >
          <LinkOutlined />
        </Button>
      </span>
      {br && <br />}
    </span>
  );
});

OntologyTerm.propTypes = {
  term: ontologyShape,
  renderLabel: PropTypes.func,
  br: PropTypes.bool,
};

export const OntologyTermList = (items) => {
  if (!Array.isArray(items)) {
    return EM_DASH;
  }
  return items.map((ontology, idx) => <OntologyTerm term={ontology} key={idx} br />);
};

OntologyTermList.propTypes = {
  items: PropTypes.arrayOf(ontologyShape),
};

export default OntologyTerm;
