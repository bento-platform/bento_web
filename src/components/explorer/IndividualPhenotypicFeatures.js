import React, {useMemo} from "react";

import {Table} from "antd";

import {EM_DASH} from "../../constants";
import {individualPropTypesShape} from "../../propTypes";

const P_FEATURES_COLUMNS = [
    {
        title: "Type",
        dataIndex: "type",
        render: (type) => <span>
            <strong>{type?.label ?? EM_DASH} </strong>
            {type?.id ?? EM_DASH}
        </span>,
    },
    {
        title: "Negated",
        dataIndex: "negated",
        render: (negated) => (negated ?? "false").toString(),
    },
    {
        title: "Extra Properties",
        dataIndex: "extra_properties",
        render: (extraProperties) =>
            (Object.keys(extraProperties ?? {}).length)
                ?  <div><pre>{JSON.stringify(extraProperties ?? {}, null, 2)}</pre></div>
                : EM_DASH,
    },

];

const IndividualPhenotypicFeatures = ({individual}) => {
    // TODO: this logic might be technically incorrect with different versions of the same resource (i.e. ontology)
    //  across multiple phenopackets
    const phenotypicFeatures = useMemo(
        () =>
            Object.values(
                Object.fromEntries(
                    (individual?.phenopackets ?? [])
                        .flatMap(p => (p.phenotypic_features ?? []))
                        .map(pf => {
                            const pfID = `${pf.type.id}:${pf.negated}`;
                            return [pfID, {...pf, id: pfID}];
                        })
                )
            ),
        [individual],
    );

    return (
        <Table
            bordered
            size="middle"
            pagination={{pageSize: 25}}
            columns={P_FEATURES_COLUMNS}
            rowKey="id"
            dataSource={phenotypicFeatures}
        />
    );
}

IndividualPhenotypicFeatures.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualPhenotypicFeatures;
