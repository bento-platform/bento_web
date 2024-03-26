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
        render: renderBoolean("excluded"),
        sorter: booleanFieldSorter("excluded"),
    },
    {
        title: "Onset Age(s)",
        dataIndex: "onset",
        render: (onset) => (<TimeElement timeElement={onset}/>),
    },
    {
        title: "Resolution age",
        dataIndex: "resolution",
        render: (resolution) => (<TimeElement timeElement={resolution}/>),
    },
    {
        title: "Disease Stage(s)",
        dataIndex: "disease_stage",
        render: (diseaseStage) => (<OntologyTermList items={diseaseStage}/>),
    },
    {
        title: "Clinical TNM finding(s)",
        dataIndex: "clinical_tnm_finding",
        render: (clinicalTnmFinding) => (<OntologyTermList items={clinicalTnmFinding} />),
    },
    {
        title: "Primary site",
        key: "primary_site",
        render: conditionalOntologyRender("primary_site"),
    },
    {
        title: "Extra Properties",
        dataIndex: "extra_properties",
        render: (extraProperties) =>
            (Object.keys(extraProperties ?? {}).length)
                ? <div>
                    <pre>{JSON.stringify(extraProperties, null, 2)}</pre>
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
