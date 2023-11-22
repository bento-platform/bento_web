import React from "react";
import ReactJson from "react-json-view";

import { Descriptions } from "antd";

import { EM_DASH } from "../../constants";
import { individualPropTypesShape } from "../../propTypes";
import { useIndividualResources } from "./utils";
import OntologyTerm from "./OntologyTerm";

const IndividualOverview = ({individual}) => {
    const resourcesTuple = useIndividualResources(individual);

    if (!individual) return <div />;
    return (
        <Descriptions layout="vertical" bordered={true} size="middle" column={6}>
            <Descriptions.Item label="Date of Birth">{individual.date_of_birth || EM_DASH}</Descriptions.Item>
            <Descriptions.Item label="Sex">{individual.sex || "UNKNOWN_SEX"}</Descriptions.Item>
            <Descriptions.Item label="Age">{getAge(individual)}</Descriptions.Item>
            <Descriptions.Item label="Karyotypic Sex">{
                individual.karyotypic_sex || "UNKNOWN_KARYOTYPE"}
            </Descriptions.Item>
            <Descriptions.Item label="Taxonomy" span={2}>
                <OntologyTerm
                    resourcesTuple={resourcesTuple}
                    term={individual.taxonomy}
                    renderLabel={label => (<em>{label}</em>)}
                />
            </Descriptions.Item>
            <Descriptions.Item label="Extra Properties" span={6}>
                {(individual.hasOwnProperty("extra_properties") && Object.keys(individual.extra_properties).length)
                    ?  (
                        <ReactJson
                            src={individual.extra_properties}
                            displayDataTypes={false}
                            name={null}
                            collapsed={1}
                            enableClipboard={false}
                        />
                    ) : EM_DASH
                }
            </Descriptions.Item>
        </Descriptions>
    );
};

IndividualOverview.propTypes = {
    individual: individualPropTypesShape,
};

function getAge(individual) {
    if (!individual?.time_at_last_encounter) {
        return "UNKNOWN_AGE";
    }

    const age = individual.time_at_last_encounter;

    if (age?.age?.iso8601duration) {
        return age.age.iso8601duration;
    }

    if (age?.age_range) {
        return JSON.stringify(age.age_range);
    }

    // other cases
    return JSON.stringify(age);
}

export default IndividualOverview;
