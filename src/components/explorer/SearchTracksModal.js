import React from "react";

import {Modal} from "antd";

import {explorerSearchResultsPropTypesShape} from "../../propTypes";
import GenomeBrowser from "./GenomeBrowser";

const SearchTracksModal = ({searchResults, ...props}) => {
    const variants = searchResults?.results?.results?.variant || [];

    // TODO: Display some basic statistics about n. of variants/tracks/etc.

    return searchResults ? <Modal title="Search Results: Tracks" {...props} width={960} footer={null}>
        <GenomeBrowser variants={variants} />
    </Modal> : null;
};

SearchTracksModal.propTypes = {
    searchResults: explorerSearchResultsPropTypesShape,
};

export default SearchTracksModal;
