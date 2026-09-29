import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import { JsonView } from "bento-file-display";

const ExtraProperties = ({ extraProperties }) => {
  if (!extraProperties || !Object.keys(extraProperties).length) {
    return EM_DASH;
  }

  return <JsonView src={extraProperties} />;
};
ExtraProperties.propTypes = {
  extraProperties: PropTypes.object,
};

export default ExtraProperties;
