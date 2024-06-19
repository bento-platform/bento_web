import React from "react";
import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import JsonView from "@/components/common/JsonView";

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
