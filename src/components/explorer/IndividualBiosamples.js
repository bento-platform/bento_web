import React from "react";

import {Table} from "antd";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";
import {individualPropTypesShape} from "../../propTypes";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const BIOSAMPLE_COLUMNS = [
    {
        title: "ID",
        key: "id",
        render: (_, individual) => individual.id,
        sorter: (a, b) => a.id.localeCompare(b.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Sampled Tissue",
        key: "sampled_tissue",
        render: (_, individual) => renderOntologyTerm(individual.sampled_tissue),
    },
    {
        title: "Procedure",
        key: "procedure",
        render: (_, individual) => <>
            <strong>Code:</strong> {renderOntologyTerm(individual.procedure.code)}<br />
            {individual.procedure.body_site
                ? <><br /><strong>Body Site:</strong> {renderOntologyTerm(individual.procedure.body_site)}</>
                : null}
        </>,
    },
    {
        title: "Ind. Age at Collection",
        key: "individual_age_at_collection",
        render: (_, individual) => {
            const age = individual.individual_age_at_collection;
            return age
                ? (age.hasOwnProperty("age") ? age.age : `Between ${age.start.age} and ${age.end.age}`)
                : EM_DASH;
        },
    },
    {
        title: "Extra Properties",
        key: "extra_properties",
        render: (_, individual) =>
            (individual.hasOwnProperty("extra_properties") && Object.keys(individual.extra_properties).length)
                ?  <div><pre>{JSON.stringify(individual.extra_properties, null, 2)}</pre></div>
                : EM_DASH,
    },
    {
        title: "Download",
        key: "extra_properties",
        render: (_, individual) =>
            (individual.hasOwnProperty("experiments") && Object.keys(individual.experiments).length)
                ? (individual.experiments).flatMap(exp => 
                    (exp.hasOwnProperty("experiment_results") && Object.keys(exp.experiment_results).length) 
                        ? (exp.experiment_results).flatMap(result => 
                            (result.hasOwnProperty("filename") && Object.keys(result.filename).length) ? result.filename : EM_DASH)
                        .filter(isKindOfVcf)
                        .flatMap(fn => <div><a>{fn}</a></div>)
                    : EM_DASH)
                : EM_DASH,
    }

];

const IndividualBiosamples = ({individual}) =>
    <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={BIOSAMPLE_COLUMNS}
           rowKey="id"
           dataSource={(individual?.phenopackets ?? []).flatMap(p => p.biosamples)} />;


function isKindOfVcf(filename) {
    return filename.toLowerCase().includes(".vcf");
  }

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualBiosamples;
