import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Modal, Skeleton, Tag } from "antd";

import { nop } from "../../../utils/misc";

import GenericSummary from "./summaries/GenericSummary";
import PhenopacketSummary from "./summaries/PhenopacketSummary";
import VariantSummary from "./summaries/VariantSummary";
import { summaryPropTypesShape } from "../../../propTypes";

const TableSummaryModal = ({
    table,
    onCancel,
    isFetchingSummaries,
    summary,
    ...props
}) => {
    table = table || {};

    let Summary = GenericSummary;
    switch (table.data_type) {
        case "variant":
            Summary = VariantSummary;
            break;
        case "phenopacket":
            Summary = PhenopacketSummary;
            break;
    }

    return (
        <Modal
            {...{ table, onCancel, isFetchingSummaries, summary, ...props }}
            title={
                <>
                    <Tag style={{ marginRight: "24px" }}>{table.data_type}</Tag>
                    <span>
                        Table &ldquo;{table.name || table.table_id || ""}
                        &rdquo;: Summary
                    </span>
                </>
            }
            footer={null}
            width={754}
            onCancel={() => (onCancel || nop)()}
        >
            {!summary || isFetchingSummaries ? (
                <Skeleton />
            ) : (
                <Summary summary={summary} />
            )}
        </Modal>
    );
};

TableSummaryModal.propTypes = {
    table: PropTypes.object, // TODO: Shared shape
    onCancel: PropTypes.func,

    isFetchingSummaries: PropTypes.bool,
    summary: summaryPropTypesShape,
};

const mapStateToProps = (state, ownProps) => ({
    isFetchingSummaries: state.tableSummaries.isFetching,
    summary: (state.tableSummaries.summariesByServiceArtifactAndTableID[
        (ownProps.table || {}).service_artifact
    ] || {})[(ownProps.table || {}).table_id],
});

export default connect(mapStateToProps)(TableSummaryModal);

// import React, { Component } from "react";
// import { connect } from "react-redux";
// import PropTypes from "prop-types";

// import { Modal, Skeleton, Tag } from "antd";

// import { nop } from "../../../utils/misc";

// import GenericSummary from "./summaries/GenericSummary";
// import PhenopacketSummary from "./summaries/PhenopacketSummary";
// import VariantSummary from "./summaries/VariantSummary";
// import { summaryPropTypesShape } from "../../../propTypes";

// class TableSummaryModal extends Component {
//     render() {
//         const table = this.props.table || {};

//         let Summary = GenericSummary;
//         switch (table.data_type) {
//             case "variant":
//                 Summary = VariantSummary;
//                 break;
//             case "phenopacket":
//                 Summary = PhenopacketSummary;
//                 break;
//         }
//         console.log(this.props);
//         return (
//             <Modal
//                 {...this.props}
//                 title={
//                     <>
//                         <Tag style={{ marginRight: "24px" }}>
//                             {table.data_type}
//                         </Tag>
//                         <span>
//                             Table &ldquo;{table.name || table.table_id || ""}
//                             &rdquo;: Summary
//                         </span>
//                     </>
//                 }
//                 footer={null}
//                 width={754}
//                 onCancel={() => (this.props.onCancel || nop)()}
//             >
//                 {!this.props.summary || this.props.isFetchingSummaries ? (
//                     <Skeleton />
//                 ) : (
//                     <Summary summary={this.props.summary} />
//                 )}
//             </Modal>
//         );
//     }
// }

// TableSummaryModal.propTypes = {
//     table: PropTypes.object, // TODO: Shared shape
//     onCancel: PropTypes.func,

//     isFetchingSummaries: PropTypes.bool,
//     summary: summaryPropTypesShape,
// };

// const mapStateToProps = (state, ownProps) => ({
//     isFetchingSummaries: state.tableSummaries.isFetching,
//     summary: (state.tableSummaries.summariesByServiceArtifactAndTableID[
//         (ownProps.table || {}).service_artifact
//     ] || {})[(ownProps.table || {}).table_id],
// });

// export default connect(mapStateToProps)(TableSummaryModal);
