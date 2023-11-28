import React from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

/**
 * A Link to the provided biosample in the explorer.
 * If no individualId prop is provided, the link will use the current individual ID in the explorer's state.
 * @param {string} biosample biosample ID to link to
 * @param {string} individualId (optional) individual ID to link to
 */
const BiosampleIDCell = React.memo(({ biosample, individualId }) => {
    const location = useLocation();
    const usedIndividualId = individualId ? individualId : useSelector(state => state.explorer?.individualId ?? "");
    return (
        <Link
            to={{
                pathname: `/data/explorer/individuals/${usedIndividualId}/biosamples/${biosample}`,
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
