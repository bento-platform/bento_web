import React from "react";
import ReactJson from "react-json-view";

import {Descriptions} from "antd";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";
import {individualPropTypesShape} from "../../propTypes";

const IndividualOverview = ({individual}) => individual ?
    <Descriptions layout="vertical" bordered={true} size="middle">
        <Descriptions.Item label="Date of Birth">{individual.date_of_birth || EM_DASH}</Descriptions.Item>
        <Descriptions.Item label="Sex">{individual.sex || "UNKNOWN_SEX"}</Descriptions.Item>
        <Descriptions.Item label="Age">{getAge(individual)}</Descriptions.Item>
        <Descriptions.Item label="Ethnicity">{individual.ethnicity || "UNKNOWN_ETHNICITY"}</Descriptions.Item>
        <Descriptions.Item label="Karyotypic Sex">{individual.karyotypic_sex || "UNKNOWN_KARYOTYPE"}</Descriptions.Item>
        {/* TODO: Link to ontology term */}
        <Descriptions.Item label="Taxonomy">
            {renderOntologyTerm(individual.taxonomy
                ? {...individual.taxonomy, label: <em>{individual.taxonomy.label}</em>}
                : null)}
        </Descriptions.Item>
        <Descriptions.Item label="Extra Properties">{
            (individual.hasOwnProperty("extra_properties") && Object.keys(individual.extra_properties).length)
                ?  <div>
                    <pre>
                          <ReactJson src={individual.extra_properties}
                                     displayDataTypes={false}
                                     name="Properties"
                                     collapsed={1}
                                     enableClipboard={false}
                          />
                    </pre>
                   </div>
                : EM_DASH
        }</Descriptions.Item>
    </Descriptions> : <div />;

IndividualOverview.propTypes = {
    individual: individualPropTypesShape,
};

function getAge(individual) {
    // This isn't a real Phenopackets value like UNKNOWN_SEX is
    if (!individual?.age?.age) {
        return "UNKNOWN_AGE";
    }

    const age = individual.age.age;

    // standard age.age
    if (typeof(age) === "string") {
        return age;
    }

    // age.start + age.end, all other cases
    return JSON.stringify(age);
}

export default IndividualOverview;
