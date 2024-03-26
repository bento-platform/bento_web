import React from "react";
import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import JsonView from "@/components/JsonView";

const ExtraProperties = ({extraProperties}) => {
    if (!extraProperties) {
        return EM_DASH;
    }

    return Object.keys(extraProperties).length ? (
        <JsonView src={extraProperties}/>
    ) : (
        EM_DASH
    );
};
ExtraProperties.propTypes = {
    extraProperties: PropTypes.object,
};

export default ExtraProperties;
