import React from "react";

import { Table } from "antd";

import { EM_DASH } from "@/constants";
import { individualPropTypesShape } from "@/propTypes";
import { booleanFieldSorter, ontologyTermSorter, renderBoolean } from "./utils";

import OntologyTerm, { OntologyTermList, conditionalOntologyRender } from "./OntologyTerm";
import TimeElement from "./TimeElement";

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
        key: "excluded",
        render: renderBoolean("excluded"),
        sorter: booleanFieldSorter("excluded"),
    },
    {
        title: "Onset Age(s)",
        key: "t_onset_ages",
        render: (_, disease) => (<TimeElement timeElement={disease?.onset}/>),
    },
    {
        title: "Resolution age",
        key: "resolution",
        render: (_, disease) => (<TimeElement timeElement={disease?.resolution}/>),
    },
    {
        title: "Disease Stage(s)",
        key: "disease_stage",
        render: (_, disease) => (<OntologyTermList items={disease?.disease_stage}/>),
    },
    {
        title: "Clinical TNM finding(s)",
        key: "clinical_tnm_finding",
        render: (_, disease) => (<OntologyTermList items={disease?.clinical_tnm_finding} />),
    },
    {
        title: "Primary site",
        key: "primary_site",
        render: conditionalOntologyRender("primary_site"),
    },
    {
        title: "Extra Properties",
        key: "extra_properties",
        render: (_, disease) =>
            (Object.keys(disease.extra_properties ?? {}).length)
                ? <div>
                    <pre>{JSON.stringify(disease.extra_properties, null, 2)}</pre>
                </div>
                : EM_DASH,
    },
];

const IndividualDiseases = ({ individual }) => {
    const diseases = individual.phenopackets.flatMap(p => p.diseases);
    return (
        <Table
            bordered
            size="middle"
            pagination={{pageSize: 25}}
            columns={DISEASES_COLUMNS}
            rowKey="id"
            dataSource={diseases}
        />
    );
};

IndividualDiseases.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualDiseases;
