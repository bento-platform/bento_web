import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";

import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";

import { Layout, Menu, Skeleton } from "antd";

import { fetchIndividualIfNecessary } from "../../modules/metadata/actions";
import {
    individualPropTypesShape,
    nodeInfoDataPropTypesShape,
} from "../../propTypes";
import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";
import { matchingMenuKeys, renderMenuItem } from "../../utils/menu";
import { urlPath, withBasePath } from "../../utils/url";

import SitePageHeader from "../SitePageHeader";
import IndividualOverview from "./IndividualOverview";
import IndividualPhenotypicFeatures from "./IndividualPhenotypicFeatures";
import IndividualBiosamples from "./IndividualBiosamples";
import IndividualExperiments from "./IndividualExperiments";
import IndividualDiseases from "./IndividualDiseases";
import IndividualMetadata from "./IndividualMetadata";
import IndividualVariants from "./IndividualVariants";
import IndividualGenes from "./IndividualGenes";
import IndividualTracks from "./IndividualTracks";

const withURLPrefix = (individual, page) =>
    withBasePath(`data/explorer/individuals/${individual}/${page}`);

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
};

const ExplorerIndividualContent = ({
    nodeInfo,
    metadataService,
    individuals,
    fetchIndividualIfNecessary,
    location,
    match,
}) => {
    const [backUrl, setBackUrl] = useState(null);
    const history = useHistory();

    const fetchIndividualData = () => {
        const individualID = match.params.individual || null;
        if (!individualID || !metadataService) return;
        fetchIndividualIfNecessary(individualID);
    };

    useEffect(() => {
        const backUrl = (location.state || {}).backUrl;
        if (backUrl) setBackUrl(backUrl);
        fetchIndividualData();
    }, [metadataService, match.params.individual]);

    // TODO: Disease content - highlight what was found in search results?

    const individualID = match.params.individual || null;
    const individualInfo = individuals[individualID] || {};
    const individual = individualInfo.data;

    const overviewUrl = withURLPrefix(individualID, "overview");
    const pfeaturesUrl = withURLPrefix(individualID, "phenotypicfeatures");
    const biosamplesUrl = withURLPrefix(individualID, "biosamples");
    const experimentsUrl = withURLPrefix(individualID, "experiments");
    const variantsUrl = withURLPrefix(individualID, "variants");
    const genesUrl = withURLPrefix(individualID, "genes");
    const diseasesUrl = withURLPrefix(individualID, "diseases");
    const metadataUrl = withURLPrefix(individualID, "metadata");
    const tracksUrl = withURLPrefix(individualID, "tracks");
    const individualMenu = [
        {
            url: overviewUrl,
            style: { marginLeft: "4px" },
            text: "Overview",
        },
        { url: pfeaturesUrl, text: "Phenotypic Features" },
        { url: biosamplesUrl, text: "Biosamples" },
        { url: experimentsUrl, text: "Experiments" },
        { url: tracksUrl, text: "Tracks" },
        { url: variantsUrl, text: "Variants" },
        { url: genesUrl, text: "Genes" },
        { url: diseasesUrl, text: "Diseases" },
        { url: metadataUrl, text: "Metadata" },
    ];

    const selectedKeys = nodeInfo
        ? matchingMenuKeys(individualMenu, urlPath(nodeInfo.CHORD_URL))
        : [];

    return (
        <>
            <SitePageHeader
                title={(individual || {}).id || "Loading..."}
                withTabBar={true}
                onBack={backUrl ? () => history.push(backUrl) : undefined}
                footer={
                    <Menu
                        mode="horizontal"
                        style={MENU_STYLE}
                        selectedKeys={selectedKeys}
                    >
                        {individualMenu.map(renderMenuItem)}
                    </Menu>
                }
            />
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    {individual && !individualInfo.isFetching ? (
                        <Switch>
                            <Route path={overviewUrl.replace(":", "\\:")}>
                                <IndividualOverview individual={individual} />
                            </Route>
                            <Route path={pfeaturesUrl.replace(":", "\\:")}>
                                <IndividualPhenotypicFeatures
                                    individual={individual}
                                />
                            </Route>
                            <Route path={biosamplesUrl.replace(":", "\\:")}>
                                <IndividualBiosamples
                                    individual={individual}
                                    experimentsUrl={experimentsUrl}
                                />
                            </Route>
                            <Route path={experimentsUrl.replace(":", "\\:")}>
                                <IndividualExperiments
                                    individual={individual}
                                />
                            </Route>
                            <Route path={tracksUrl.replace(":", "\\:")}>
                                <IndividualTracks individual={individual} />
                            </Route>
                            <Route path={variantsUrl.replace(":", "\\:")}>
                                <IndividualVariants
                                    individual={individual}
                                    tracksUrl={tracksUrl}
                                />
                            </Route>
                            <Route path={genesUrl.replace(":", "\\:")}>
                                <IndividualGenes
                                    individual={individual}
                                    tracksUrl={tracksUrl}
                                />
                            </Route>
                            <Route path={diseasesUrl.replace(":", "\\:")}>
                                <IndividualDiseases individual={individual} />
                            </Route>
                            <Route path={metadataUrl.replace(":", "\\:")}>
                                <IndividualMetadata individual={individual} />
                            </Route>
                            <Redirect to={overviewUrl.replace(":", "\\:")} />
                        </Switch>
                    ) : (
                        <Skeleton />
                    )}
                </Layout.Content>
            </Layout>
        </>
    );
};

ExplorerIndividualContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    metadataService: PropTypes.object, // TODO
    individuals: PropTypes.objectOf(individualPropTypesShape),

    fetchIndividualIfNecessary: PropTypes.func,

    location: ReactRouterPropTypes.location.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
};

const mapStateToProps = (state) => ({
    nodeInfo: state.nodeInfo.data,
    metadataService: state.services.metadataService,
    individuals: state.individuals.itemsByID,
});

export default connect(mapStateToProps, { fetchIndividualIfNecessary })(
    ExplorerIndividualContent
);
