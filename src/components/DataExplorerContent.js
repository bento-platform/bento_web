import React, { useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";

import { SITE_NAME } from "@/constants";


const DataExplorerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Explore Your Data`;
    }, []);

    return (
        <Switch>
            <Route path="/data/explorer/search"><ExplorerSearchContent /></Route>
            <Route path="/data/explorer/individuals/:individual"><ExplorerIndividualContent /></Route>
            <Route path="/data/explorer/genome"><ExplorerGenomeBrowserContent /></Route>
            <Route path="/data/explorer" render={() => <Redirect to="/data/explorer/search" />} />
        </Switch>
    );
};
export default DataExplorerContent;
