import React from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const BiosampleIDCell = React.memo(({ biosample, individualId }) => {
    const location = useLocation();
    return (
        <Link
            to={{
                pathname: `/data/explorer/individuals/${individualId}/biosamples/${biosample}`,
                state: { backUrl: location.pathname },
            }}
        >
            {biosample}
        </Link>
    );
});

BiosampleIDCell.propTypes = {
    biosample: PropTypes.string.isRequired,
    individualId: PropTypes.string.isRequired,
};

export default BiosampleIDCell;
