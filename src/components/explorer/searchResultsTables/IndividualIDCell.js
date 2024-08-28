import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { explorerIndividualUrl } from "../utils";

const IndividualIDCell = memo(({ individual: { id, alternate_ids: alternateIds } }) => {
  const location = useLocation();
  const alternateIdsRender = alternateIds?.length ? " (" + alternateIds.join(", ") + ")" : "";
  return (
    <>
      <Link to={`${explorerIndividualUrl(id)}/overview`} state={{ backUrl: location.pathname }}>
        {id}
      </Link>{" "}
      {alternateIdsRender}
    </>
  );
});

IndividualIDCell.propTypes = {
  individual: PropTypes.object.isRequired,
};

export default IndividualIDCell;
