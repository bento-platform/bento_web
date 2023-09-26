import React, { useMemo } from "react";

import { Table } from "antd";

import { individualPropTypesShape } from "../../propTypes";
import { EM_DASH } from "../../constants";
import { ontologyTermSorter, useIndividualResources } from "./utils";

import OntologyTerm from "./OntologyTerm";

// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualDiseases = ({ individual }) => {
    const diseases = individual.phenopackets.flatMap(p => p.diseases);
    const resourcesTuple = useIndividualResources(individual);

    const columns = useMemo(() => [
        {
            title: "Disease",
            dataIndex: "term",
            // Tag the ontology term with a data attribute holding the disease ID. This has no effect, but might
            // help us debug diseases in production if we need it.
            render: (term, disease) => (
                <OntologyTerm resourcesTuple={resourcesTuple} term={term} data-disease-id={disease.id} />
            ),
            sorter: ontologyTermSorter("term"),
        },
        {
            title: "Onset Age(s)",
            key: "t_onset_ages",
            render: (_, disease) =>
                // Print onset age
                (disease.hasOwnProperty("onset") && Object.keys(disease.onset).length)
                    // Single onset age
                    ? (disease.onset.hasOwnProperty("age") && Object.keys(disease.onset.age).length)
                        ? <div>{disease.onset.age}</div>
                        // Onset age start and end
                        : (disease.onset.hasOwnProperty("start") && Object.keys(disease.onset.start).length)
                            ? <div>{disease.onset.start.age} - {disease.onset.end.age}</div>
                            // Onset age label only
                            : disease.onset.label
                                ? <OntologyTerm resourcesTuple={resourcesTuple} term={disease.onset} />
                                : EM_DASH
                    : EM_DASH,
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
    ], [resourcesTuple]);

    return (
        <Table
            bordered
            size="middle"
            pagination={{pageSize: 25}}
            columns={columns}
            rowKey="id"
            dataSource={diseases}
        />
    );
};

IndividualDiseases.propTypes = {
    individual: individualPropTypesShape.isRequired,
};

export default IndividualDiseases;
