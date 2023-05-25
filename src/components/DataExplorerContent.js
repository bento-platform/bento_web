import React, {useEffect} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";

import {SITE_NAME} from "../constants";


const DataExplorerContent = () => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Explore Your Data`;
    }, []);

    return <Switch>
        <Route path="/data/explorer/search" component={ExplorerSearchContent} />
        <Route path="/data/explorer/individuals/:individual" component={ExplorerIndividualContent} />
        <Route path="/data/explorer/genome" component={ExplorerGenomeBrowserContent} />
        <Redirect from="/data/explorer" to="/data/explorer/search" />
    </Switch>;
};
export default DataExplorerContent;
