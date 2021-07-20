import React from "react";

import {Modal} from "antd";

import {explorerSearchResultsPropTypesShape} from "../../propTypes";
import GenomeBrowser from "./GenomeBrowser";

const SearchTracksModal = ({searchResults, ...props}) => {
    console.log("searchResults", searchResults);

    //const variants = searchResults.results.results.variant || [];
    const variants = [
        {
            type: "variant",
            sourceType: "bento",
            variants,
            variantSetId: "result_variants",
            name: "Variant Result Set",
            height: 100,
            squishedCallHeight: 1,
            expandedCallHeight: 10,
            displayMode: "expanded",
            visibilityWindow: 100,
            name: "HG01402",
            url: "https://bentov2.local/api/drs/objects/4c535500-2998-4a80-aa11-f2662bd5fc6e/download",
            indexURL: "https://bentov2.local/api/drs/objects/6e91a591-b1db-4c02-bad1-e2c9adb6221e/download",
            format: "vcf"
        }
    ];
    
    // TODO: Display some basic statistics about n. of variants/tracks/etc.

    // Also TODO: retrieve experiments filename(s), query DRS (using modified DRS URL(s) if necessary)

    return searchResults ? <Modal title="Search Results: Tracks" {...props} width={960} footer={null}>
        <GenomeBrowser variants={variants} />
    </Modal> : null;
};

SearchTracksModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchTracksModal;
