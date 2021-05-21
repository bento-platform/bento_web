import React from "react";

import {Table} from "antd";

import {EM_DASH} from "../../constants";
import {individualPropTypesShape} from "../../propTypes";

const P_FEATURES_COLUMNS = [
    {
        title: "Type",
        key: "type",
        render: (_, individual) => <span>
            <strong>{((individual || {}).type || {}).label || EM_DASH} </strong>
            {((individual || {}).type || {}).id || EM_DASH}
        </span>,
    },
    {
        title: "Negated",
        key: "negated",
        render: (_, individual) => ((individual || {}).negated || "false").toString(),
    },
    {
        title: "Extra Properties",
        key: "extra_properties",
        render: (_, individual) =>
            (individual.hasOwnProperty("extra_properties") && Object.keys(individual.extra_properties).length)
                ?  <div><pre>{JSON.stringify(individual.extra_properties, null, 2)}</pre></div>
                : EM_DASH,
    }

];

const IndividualPhenotypicFeatures = ({individual}) =>
    <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={P_FEATURES_COLUMNS}
           rowKey="id"
           dataSource={(individual || {}).phenopackets.flatMap(p => (p.phenotypic_features || []))} />;

IndividualPhenotypicFeatures.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualPhenotypicFeatures;
