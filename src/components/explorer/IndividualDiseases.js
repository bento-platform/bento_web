import React from "react";

import {Table} from "antd";


import {diseasePropTypesShape} from "../../propTypes";
import { EM_DASH } from "../../constants";

// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const DISEASE_COLUMNS = [
    {
        title: "Disease ID",
        key: "d_id",
        render: (_, individual) => individual.id,
        sorter: (a, b) => a.id.toString().localeCompare(b.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Term ID",
        key: "t_id",
        render: (_, individual) => individual.term.id,
    },
    {
        title: "Label",
        key: "t_label",
        render: (_, individual) => individual.term.label,
    },
    {
        title: "Onset Age(s)",
        key: "t_onset_ages",
        render: (_, individual) =>
        // Print onset age
            (individual.hasOwnProperty("onset") && Object.keys(individual.onset).length)
            // Single onset age
                ?  (individual.onset.hasOwnProperty("age") && Object.keys(individual.onset.age).length)
                    ?  <div>{individual.onset.age}</div>
                    // Onset age start and end
                    : (individual.onset.hasOwnProperty("start") && Object.keys(individual.onset.start).length)
                        ?  <div>{individual.onset.start.age} - {individual.onset.end.age}</div>
                        // Onset age label only
                        : (individual.onset.hasOwnProperty("label") && Object.keys(individual.onset.label).length)
                            ?  <div>{individual.onset.label} ({individual.onset.id})</div>
                            : EM_DASH
                : EM_DASH,
    },
    {
        title: "Extra Properties",
        key: "extra_properties",
        render: (_, individual) =>
            (individual.hasOwnProperty("extra_properties") && Object.keys(individual.extra_properties).length)
                ?  <div><pre>{JSON.stringify(individual.extra_properties, null, 2)}</pre></div>
                : EM_DASH,
    },
];

const IndividualDiseases = ({individual}) =>
    <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={DISEASE_COLUMNS}
           rowKey="id"
           dataSource={(individual || {}).phenopackets.flatMap(p => p.diseases)} />;



IndividualDiseases.propTypes = {
    individual: diseasePropTypesShape,
};

export default IndividualDiseases;
