import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import { ExplorerIndividualContext } from "../contexts/individual";
import { explorerIndividualUrl } from "../utils";

/**
 * A Link to the provided biosample in the explorer.
 * If no individualID prop is provided, the link will use the current individual ID in the explorer's state.
 * @param {string} biosample biosample ID to link to
 * @param {string} individualID (optional) individual ID to link to
 */
const BiosampleIDCell = React.memo(({ biosample, individualID }) => {
  const location = useLocation();
  const { individualID: contextIndividualID } = useContext(ExplorerIndividualContext);
  const usedIndividualID = individualID ?? contextIndividualID;
  return (
    <Link
      to={`${explorerIndividualUrl(usedIndividualID)}/biosamples/${biosample}`}
      state={{ backUrl: location.pathname }}
    >
      {biosample}
    </Link>
  );
});

BiosampleIDCell.propTypes = {
  biosample: PropTypes.string.isRequired,
  individualID: PropTypes.string,
};

export default BiosampleIDCell;
