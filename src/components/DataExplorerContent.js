import React, {useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";

import {SITE_NAME} from "../constants";
import {withBasePath} from "../utils/url";

import { performGetGohanVariantsOverviewIfPossible } from "../modules/explorer/actions";


const DataExplorerContent = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        document.title = `${SITE_NAME} - Explore Your Data`;

        // Trigger Gohan variants-overview fetch
        dispatch(performGetGohanVariantsOverviewIfPossible());
    }, []);

    const chordURL = useSelector(state => state.nodeInfo.data?.CHORD_URL);
    if (!chordURL) {
        return null;
    }

    return <Switch>
        <Route path={withBasePath("data/explorer/search")}
               component={ExplorerSearchContent} />
        <Route path={withBasePath("data/explorer/individuals/:individual")}
               component={ExplorerIndividualContent} />
        <Route path={withBasePath("data/explorer/genome")}
               component={ExplorerGenomeBrowserContent} />
        <Redirect from={withBasePath("data/explorer")}
                  to={withBasePath("data/explorer/search")} />
    </Switch>;
};
export default DataExplorerContent;
