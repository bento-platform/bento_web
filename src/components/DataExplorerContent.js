import React, { useEffect } from "react";
import { connect } from "react-redux";

import { Redirect, Route, Switch } from "react-router-dom";

import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
import ExplorerSearchContent from "./explorer/ExplorerSearchContent";

import { SITE_NAME } from "../constants";
import { withBasePath } from "../utils/url";
import { nodeInfoDataPropTypesShape } from "../propTypes";

const DataExplorerContent = ({ nodeInfo }) => {
    useEffect(() => {
        document.title = `${SITE_NAME} - Explore Your Data`;
    });

    if (!nodeInfo.CHORD_URL) return null;
    return (
        <Switch>
            <Route
                path={withBasePath("data/explorer/search")}
                component={ExplorerSearchContent}
            />
            <Route
                path={withBasePath("data/explorer/individuals/:individual")}
                component={ExplorerIndividualContent}
            />
            <Route
                path={withBasePath("data/explorer/genome")}
                component={ExplorerGenomeBrowserContent}
            />
            <Redirect
                from={withBasePath("data/explorer")}
                to={withBasePath("data/explorer/search")}
            />
        </Switch>
    );
};

DataExplorerContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
};

const mapStateToProps = (state) => ({
    nodeInfo: state.nodeInfo.data,
});

export default connect(mapStateToProps)(DataExplorerContent);

// import React, {Component} from "react";
// import {connect} from "react-redux";

// import {Redirect, Route, Switch} from "react-router-dom";

// import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";
// import ExplorerIndividualContent from "./explorer/ExplorerIndividualContent";
// import ExplorerSearchContent from "./explorer/ExplorerSearchContent";

// import {SITE_NAME} from "../constants";
// import {withBasePath} from "../utils/url";
// import {nodeInfoDataPropTypesShape} from "../propTypes";

// class DataExplorerContent extends Component {
//     componentDidMount() {
//         document.title = `${SITE_NAME} - Explore Your Data`;
//     }

//     render() {
//         if (!this.props.nodeInfo.CHORD_URL) return null;
//         return <Switch>
//             <Route path={withBasePath("data/explorer/search")}
//                    component={ExplorerSearchContent} />
//             <Route path={withBasePath("data/explorer/individuals/:individual")}
//                    component={ExplorerIndividualContent} />
//             <Route path={withBasePath("data/explorer/genome")}
//                    component={ExplorerGenomeBrowserContent} />
//             <Redirect from={withBasePath("data/explorer")}
//                       to={withBasePath("data/explorer/search")} />
//         </Switch>;
//     }
// }

// DataExplorerContent.propTypes = {
//     nodeInfo: nodeInfoDataPropTypesShape,
// };

// const mapStateToProps = state => ({
//     nodeInfo: state.nodeInfo.data,
// });

// export default connect(mapStateToProps)(DataExplorerContent);
