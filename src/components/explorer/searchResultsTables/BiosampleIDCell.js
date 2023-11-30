import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import { ExplorerIndividualContext } from "../contexts/individual";
import { explorerIndividualUrl } from "../utils";

/**
 * A Link to the provided biosample in the explorer.
 * If no individualId prop is provided, the link will use the current individual ID in the explorer's state.
 * @param {string} biosample biosample ID to link to
 * @param {string} individualId (optional) individual ID to link to
 */
const BiosampleIDCell = React.memo(({ biosample, individualId }) => {
    const location = useLocation();
    const { contextIndividualID } = useContext(ExplorerIndividualContext);
    const usedIndividualId = individualId ?? contextIndividualID;
    return (
        <Link
            to={{
                pathname: `${explorerIndividualUrl(usedIndividualId)}/biosamples/${biosample}`,
                state: { backUrl: location.pathname },
            }}
        >
            {biosample}
        </Link>
    );
});

BiosampleIDCell.propTypes = {
    biosample: PropTypes.string.isRequired,
    individualId: PropTypes.string,
};

export default BiosampleIDCell;
