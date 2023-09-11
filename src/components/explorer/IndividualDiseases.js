import React, { useMemo } from "react";

import { Table } from "antd";

import { individualPropTypesShape } from "../../propTypes";
import { EM_DASH } from "../../constants";
import { ontologyTermSorter } from "./utils";

import OntologyTerm from "./OntologyTerm";

// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualDiseases = ({ individual }) => {
    const diseases = individual.phenopackets.flatMap(p => p.diseases);

    const columns = useMemo(() => [
        {
            title: "Disease ID",
            key: "id",
            sorter: (a, b) => a.id.toString().localeCompare(b.id),
            defaultSortOrder: "ascend",
        },
        {
            title: "term",
            dataIndex: "term",
            render: (term) => <OntologyTerm individual={individual} term={term} />,
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
                                ? <OntologyTerm individual={individual} term={disease.onset} />
                                : EM_DASH
                    : EM_DASH,
        },
        {
            title: "Extra Properties",
            key: "extra_properties",
            render: (_, individual) =>
                (Object.keys(individual.extra_properties ?? {}).length)
                    ? <div>
                        <pre>{JSON.stringify(individual.extra_properties, null, 2)}</pre>
                    </div>
                    : EM_DASH,
        },
    ], [individual]);

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
