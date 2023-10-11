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
            render: (_, disease) => {
                if (disease.hasOwnProperty("onset") && Object.keys(disease.onset).length) {
                    const onset = disease.onset;
                    if (onset.hasOwnProperty("age") && Object.keys(onset.age).length) {
                        return <div>{onset.age.iso8601duration}</div>;
                    } else if (onset.hasOwnProperty("ageRange") && Object.keys(onset.age_range).length) {
                        return <div>{onset.ageRange.start.iso8601duration} - {onset.ageRange.end.iso8601duration}</div>;
                    } else if (onset.hasOwnProperty("ontologyClass") && Object.keys(onset.ontology_class).length) {
                        return <OntologyTerm resourcesTuple={resourcesTuple} term={onset.ontologyClass} />;
                    }
                    // TODO: new stuff that comes with TIME_ELEMENT representation
                }
                return EM_DASH;
            },
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
