import React from "react";
import PropTypes from "prop-types";

import { EM_DASH } from "@/constants";
import OntologyTerm from "./OntologyTerm";

const TIME_ELEMENT_TYPES_LABELS = {
    "age": "Age",
    "gestational_age": "Gestational Age",
    "age_range": "Age Range",
    "ontology_class": "Ontology Class",
    "timestamp": "Timestamp",
    "interval": "Interval",
};

const getTimeElementTypeLabel = (timeElement) => {
    const keys = Object.keys(timeElement);
    if (keys ?? keys.length === 1) {
        // A Phenopacket TimeElement should only have 1 property
        const type = keys[0];
        if (type in TIME_ELEMENT_TYPES_LABELS) {
            const label = TIME_ELEMENT_TYPES_LABELS[type];
            return [type, label];
        }
    }
    return [null, "NOT_SUPPORTED"];
};

export const TimeInterval = ({timeInterval, br}) => {
    return (
        <span>
            <strong>Start:</strong>{" "}<>{timeInterval.start}</>
            {br ? <br/> : " "}
            <strong>End:</strong>{" "}<>{timeInterval.end}</>
        </span>
    );
};
TimeInterval.propTypes = {
    timeInterval: PropTypes.object,
    br: PropTypes.bool,
};

const InnerTimeElement = ({type, timeElement}) => {
    switch (type) {
        case "age":
            return <span>{timeElement.age.iso8601duration}</span>;
        case "gestational_age":
            return <span>
                <strong>Weeks:</strong>{" "}{timeElement.gestationalAge.weeks}{" "}
                <strong>Days:</strong>{" "}{timeElement.gestationalAge.days}
            </span>;
        case "age_range":
            return <span>
                <strong>Start:</strong>{" "}<>{timeElement.age_range.start.iso8601duration}</>{" "}
                <strong>End:</strong>{" "}<>{timeElement.age_range.end.iso8601duration}</>
            </span>;
        case "ontology_class":
            return <OntologyTerm term={timeElement.ontology_class}/>;
        case "timestamp":
            return <span>{timeElement.timestamp}</span>;
        case "interval":
            return <TimeInterval timeInterval={timeElement.interval}/>;
        default:
            return EM_DASH;
    }
};
InnerTimeElement.propTypes = {
    type: PropTypes.string,
    timeElement: PropTypes.object,
};

const TimeElement = React.memo(({timeElement}) => {
    if (!timeElement) {
        return EM_DASH;
    }

    const [timeType, label] = getTimeElementTypeLabel(timeElement);

    if (!timeType) {
        // Unexpected TimeElement type
        console.error("Bad time element:", timeElement);
        return EM_DASH;
    }

    return (
        <span>
            <strong>{label}: </strong>
            <InnerTimeElement type={timeType} timeElement={timeElement}/>
        </span>
    );
});

TimeElement.propTypes = {
    timeElement: PropTypes.object,
};

export default TimeElement;
