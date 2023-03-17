import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withBasePath } from "../../utils/url";
import ExplorerSearchResultsTableComp from "./ExplorerSearchResultsTableComp";

const biosampleRender = (individual, record) => {
    const alternateIds = individual.alternate_ids ?? [];
    const listRender = alternateIds.length ? " (" + alternateIds.join(", ") + ")" : "";
    return (
        <>
            <Link
                to={{
                    pathname: withBasePath(`data/explorer/individuals/${record.individual.id}/biosamples`),
                    state: { backUrl: location.pathname },
                }}
            >
                {individual}
            </Link>{" "}
            {listRender}
        </>
    );
};

const SEARCH_RESULT_COLUMNS_BIOSAMPLE = [
    {
        title: "Biosample",
        dataIndex: "im_type",
        //key: "im_type",
        /* render: (im_type) => (
            <>
                <Link
                    to={(location) => ({
                        pathname: withBasePath(`data/explorer/biosamples/${im_type}/overview`),
                        state: { backUrl: location.pathname },
                    })}
                >
                    {im_type}
                </Link>
            </>
        ), */
        render: (im_type, record) => biosampleRender(im_type, record),
        sorter: (a, b) => a.im_type.localeCompare(b.im_type),
        defaultSortOrder: "ascend",
        //key: (record) => record.im_type,
    },
    {
        title: "Individual",
        dataIndex: "individual",
        render: (individual) => <>{individual.id}</>,
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Experiments",
        dataIndex: "studies_type",
        render: (studies_type) => (
            <>
                {studies_type.every((s) => s !== null) ? (
                    <>
                        {studies_type.length} Experiment{studies_type.length === 1 ? "" : "s"}
                        {studies_type.length ? ": " : ""}
                        {studies_type.join(", ")}
                    </>
                ) : (
                    <>—</>
                )}
            </>
        ),
        //render: (studies_type) => <>{studies_type}</>,
        sorter: (a, b) => a.studies_type.length - b.studies_type.length,
        sortDirections: ["descend", "ascend", "descend"],
    },
    {
        title: "Sampled Tissues",
        dataIndex: "sampled_tissues",
        // [{id: 'OBI:0000880', label: 'RNA extract'}, {id: 'OBI:0000880', label: 'RNA extract'}]
        // map to label
        render: (sampled_tissues) => {
            return sampled_tissues.map((m) => m.label)[0];
        },
        sorter: (a, b) => {
            if (a.sampled_tissues[0].label && b.sampled_tissues[0].label) {
                return a.sampled_tissues[0].label.toString().localeCompare(b.sampled_tissues[0].label.toString());
            }
            return 0;
        },
        defaultSortOrder: "ascend",
    },
    {
        title: "Available Experiments",
        dataIndex: "experiments_type",
        //  ['RNA-Seq', 'RNA-Seq']
        render: (experiments_type) => {
            if (experiments_type.every((s) => s !== null)) {
                return experiments_type.map((other_thing) => other_thing).join(", ");
            } else {
                return "—";
            }
        },
        //render: (other_thingx) => <>{other_thingx}</>,
        /* sorter: (a, b) => a.other_thingx.localeCompare(b.other_thingx),
        sortDirections: ["descend", "ascend", "descend"], */

        sorter: (a, b) => a.experiments_type.length - b.experiments_type.length,
        sortDirections: ["descend", "ascend", "descend"],
    },
];

const BiosamplesTable = ({ data }) => {
    return (
        <ExplorerSearchResultsTableComp dataStructure={SEARCH_RESULT_COLUMNS_BIOSAMPLE} type="biosample" data={data} />
    );
};

BiosamplesTable.propTypes = {
    data: PropTypes.array.isRequired,
};

export default BiosamplesTable;
