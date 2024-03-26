import React from "react";
import { Descriptions } from "antd";
import PropTypes from "prop-types";

import { diseasePropTypesShape, individualPropTypesShape } from "@/propTypes";
import { booleanFieldSorter, ontologyTermSorter, renderBoolean, useIndividualPhenopacketDataIndex } from "./utils";

import OntologyTerm, { OntologyTermList } from "./OntologyTerm";
import TimeElement from "./TimeElement";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import ExtraProperties from "./ExtraProperties";

// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const DISEASES_COLUMNS = [
    {
        title: "Disease",
        dataIndex: "term",
        // Tag the ontology term with a data attribute holding the disease ID. This has no effect, but might
        // help us debug diseases in production if we need it.
        render: (term, disease) => (
            <OntologyTerm term={term} data-disease-id={disease.id} />
        ),
        sorter: ontologyTermSorter("term"),
    },
    {
        title: "Excluded",
        dataIndex: "excluded",
        render: renderBoolean("excluded"),
        sorter: booleanFieldSorter("excluded"),
    },
    {
        title: "Onset Age",
        dataIndex: "onset",
        render: (onset) => (<TimeElement timeElement={onset}/>),
    },
    {
        title: "Resolution Age",
        dataIndex: "resolution",
        render: (resolution) => (<TimeElement timeElement={resolution}/>),
    },
];

const DiseaseDetails = ({disease}) => (
    <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Disease Stage(s)">
            <OntologyTermList items={disease?.disease_stage}/>
        </Descriptions.Item>
        <Descriptions.Item label="Clinical TNM finding(s)">
            <OntologyTermList items={disease?.clinical_tnm_finding}/>
        </Descriptions.Item>
        <Descriptions.Item label="Primary site">
            <OntologyTerm term={disease?.primary_site}/>
        </Descriptions.Item>
        <Descriptions.Item label="Extra Properties">
            <ExtraProperties extraProperties={disease?.extra_properties}/>
        </Descriptions.Item>
    </Descriptions>
);
DiseaseDetails.propTypes = {
    disease: diseasePropTypesShape,
};

const Diseases = ({ diseases, handleSelect }) => (
    <RoutedIndividualContentTable
        data={diseases}
        urlParam="selectedDisease"
        columns={DISEASES_COLUMNS}
        rowKey="idx"
        handleRowSelect={handleSelect}
        expandedRowRender={(disease) => ( <DiseaseDetails disease={disease}/> )}
    />
);
Diseases.propTypes = {
    diseases: PropTypes.arrayOf(diseasePropTypesShape),
    handleSelect: PropTypes.func,
};

const IndividualDiseases = ({ individual }) => {
    const diseases = useIndividualPhenopacketDataIndex(individual, "diseases");
    return (
        <RoutedIndividualContent
            urlParam="selectedDisease"
            renderContent={({ onContentSelect }) => (
                <Diseases
                    diseases={diseases}
                    handleSelect={onContentSelect}
                />
            )}
        />
    );
};

IndividualDiseases.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualDiseases;
