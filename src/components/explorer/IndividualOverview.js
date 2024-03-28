import React from "react";

import { Descriptions } from "antd";

import { EM_DASH } from "@/constants";
import { individualPropTypesShape } from "@/propTypes";
import OntologyTerm from "./OntologyTerm";
import TimeElement from "./TimeElement";
import ExtraProperties from "./ExtraProperties";

const IndividualOverview = ({individual}) => {
    if (!individual) return <div />;
    return (
        <Descriptions layout="vertical" bordered={true} size="middle" column={6}>
            <Descriptions.Item label="Date of Birth">{individual.date_of_birth || EM_DASH}</Descriptions.Item>
            <Descriptions.Item label="Sex">{individual.sex || "UNKNOWN_SEX"}</Descriptions.Item>
            <Descriptions.Item label="Time At Last Encounter">
                <TimeElement timeElement={individual?.time_at_last_encounter}/>
            </Descriptions.Item>
            <Descriptions.Item label="Karyotypic Sex">{
                individual.karyotypic_sex || "UNKNOWN_KARYOTYPE"}
            </Descriptions.Item>
            <Descriptions.Item label="Taxonomy" span={2}>
                <OntologyTerm
                    term={individual.taxonomy}
                    renderLabel={label => (<em>{label}</em>)}
                />
            </Descriptions.Item>
            <Descriptions.Item label="Extra Properties" span={6}>
                <ExtraProperties extraProperties={individual?.extra_properties} />
            </Descriptions.Item>
        </Descriptions>
    );
};

IndividualOverview.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualOverview;
