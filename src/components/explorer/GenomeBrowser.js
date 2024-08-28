import { Component } from "react";

// TODO: rewrite this component using views of vcf files, focused on variants of interest

class GenomeBrowser extends Component {
  render() {
    return null;
  }
}

export default GenomeBrowser;

// import {Component, createRef} from "react";
// import PropTypes from "prop-types";
// import {Table, Divider} from "antd";
// import igv from "igv/js";

// TODO: This should be a service
// const REFERENCE_GENOME_LOOKUP = {
//     "ncbi36": "hg18",
//     "grch37": "hg19",
//     "grch38": "hg38",

//     "hg18": "hg18",
//     "hg19": "hg19",
//     "hg38": "hg38",
// };

// class GenomeBrowser extends Component {
//     constructor(props) {
//         super(props);

//         this.browser = null;
//         this.igvContainer = createRef();
//         this.igvOptions = this.igvOptions.bind(this);
//         this.configureBrowser = this.configureBrowser.bind(this);

//         // Column configuration for match table
//         this.columns = [
//             {
//                 title: "Chromosome",
//                 dataIndex: "chromosome",
//             },
//             {
//                 title: "Start",
//                 dataIndex: "start",
//             },
//             {
//                 title: "End",
//                 dataIndex: "end",
//             },
//             {
//                 title: "Reference Bases",
//                 dataIndex: "ref",
//             },
//             {
//                 title: "Alternate Bases",
//                 dataIndex: "alt",
//             },
//             {
//                 title: "Action",
//                 render: (text, variant) => (<a onClick={() => this.changeLocus(variant)}>Show variant</a>)
//             },
//         ];
//     }

//     static formatVariantLocation(variant) {
//         console.log("Attempting to relocate to", variant);
//         if (!variant) return;
//         return `chr${variant.chromosome}:${variant.start}-${variant.end}`;
//     }

//     igvOptions() {
//         const variants = this.props.variants || [];
//         console.log("variants", variants);
//         return {
//             genome: REFERENCE_GENOME_LOOKUP[(variants[0] || {}).assembly_id] || "hg19",
//             locus: variants.length
//                 ? GenomeBrowser.formatVariantLocation(variants[0])
//                 : undefined,
//             minimumBases: 40,
//             tracks: [
//                 {
//                     type: "variant",
//                     sourceType: "bento",
//                     format: "vcf",
//                     variants,
//                     variantSetId: "result_variants",
//                     name: "Variant Result Set",
//                     height: 100,
//                     squishedCallHeight: 1,
//                     expandedCallHeight: 10,
//                     displayMode: "expanded",
//                     visibilityWindow: 100,
//                 },
//             ]  // TODO: Multiple tracks for different individuals! Based on linked field sets?
//         };
//     }

//     configureBrowser(containerNode) {
//         igv.createBrowser(containerNode, this.igvOptions()).then(browser => this.browser = browser);
//     }

//     componentDidMount() {
//         this.configureBrowser(this.igvContainer.current
//             || document.getElementById("igv-container"));
//     }

//     componentDidUpdate(prevProps, _prevState, _snapshot) {
//         if (JSON.stringify(prevProps.variants) !== JSON.stringify(this.props.variants)) {
//             // Re-create browser
//             igv.removeBrowser(igv.getBrowser());
//             this.configureBrowser(this.igvContainer.current
//                 || document.getElementById("igv-container"));
//         }
//     }

//     changeLocus(variant) {
//         if (!this.browser || !variant) return;
//         this.browser.search(GenomeBrowser.formatVariantLocation(variant));
//     }

//     render() {
//         return <>
//             <div id="igv-container" />
//             <Divider orientation="left">Variant List</Divider>
//             <Table
//                 bordered={true}
//                 size="middle"
//                 columns={this.columns}
//                 dataSource={this.props.variants || []}
//                 pagination={{pageSize: 10}}
//                 scroll={{y: 400}}
//             />
//         </>;
//     }
// }

// GenomeBrowser.propTypes = {
//     variants: PropTypes.arrayOf(PropTypes.shape({
//         alt: PropTypes.arrayOf(PropTypes.string),
//         assembly_id: PropTypes.string,
//         calls: PropTypes.arrayOf(PropTypes.shape({
//             genotype_bases: PropTypes.arrayOf(PropTypes.string),
//             genotype_type: PropTypes.string,  // TODO: oneOf
//             sample_id: PropTypes.string,
//             // TODO: phase_set
//         })),
//         chromosome: PropTypes.string,
//     })),
// };

// export default GenomeBrowser;
