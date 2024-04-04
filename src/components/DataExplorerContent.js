import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";

import { SITE_NAME } from "@/constants";


const DataExplorerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Explore Your Data`;
    }, []);

    return (
        <Routes>
            <Route path="search/*" element={<ExplorerSearchContent />} />
            <Route path="individuals/:individual/*" element={<ExplorerIndividualContent />} />
            <Route path="genome/*" element={<ExplorerGenomeBrowserContent />} />
            <Route path="*" element={<Navigate to="search" replace={true} />} />
        </Routes>
    );
};
export default DataExplorerContent;
