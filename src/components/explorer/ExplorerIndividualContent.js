import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";

import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";

import {Layout, Menu, Skeleton} from "antd";

import { fetchIndividualIfNecessary } from "../../modules/metadata/actions";
import { individualPropTypesShape } from "../../propTypes";
import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";
import { matchingMenuKeys, renderMenuItem } from "../../utils/menu";
import { urlPath } from "../../utils/url";

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
import IndividualPhenopackets from "./IndividualPhenopackets";

import { BENTO_URL } from "../../config";

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
};


class ExplorerIndividualContent extends Component {
    constructor(props) {
        super(props);

        this.fetchIndividualData = this.fetchIndividualData.bind(this);

        this.state = {
            backUrl: null,
        };
    }

    fetchIndividualData() {
        const individualID = this.props.match.params.individual || null;
        if (!individualID || !this.props.metadataService) return;
        this.props.fetchIndividualIfNecessary(individualID);
    }

    // noinspection JSCheckFunctionSignatures
    componentDidUpdate(prevProps) {
        if (!prevProps.metadataService && this.props.metadataService) {
            // We loaded metadata service, so we can load individual data now
            this.fetchIndividualData();
        }
    }

    componentDidMount() {
        const { location } = this.props;
        const { backUrl } = location.state || {};
        if (backUrl) this.setState({ backUrl });
        this.fetchIndividualData();
    }

    render() {
        // TODO: Disease content - highlight what was found in search results?

        console.log(this.props.match);

        const individualID = this.props.match.params.individual || null;
        const individualInfo = this.props.individuals[individualID] || {};
        const individual = individualInfo.data;

        const individualUrl = this.props.match.url;

        const overviewUrl = `${individualUrl}/overview`;
        const phenotypicFeaturesUrl = `${individualUrl}/phenotypic-features`;
        const biosamplesUrl = `${individualUrl}/biosamples`;
        const experimentsUrl = `${individualUrl}/experiments`;
        const variantsUrl = `${individualUrl}/variants`;
        const genesUrl = `${individualUrl}/genes`;
        const diseasesUrl = `${individualUrl}/diseases`;
        const metadataUrl = `${individualUrl}/metadata`;
        const tracksUrl = `${individualUrl}/tracks`;
        const phenopacketsUrl = `${individualUrl}/phenopackets`;

        const individualMenu = [
            {url: overviewUrl, style: {marginLeft: "4px"}, text: "Overview"},
            {url: phenotypicFeaturesUrl, text: "Phenotypic Features"},
            {url: biosamplesUrl, text: "Biosamples"},
            {url: experimentsUrl, text: "Experiments"},
            {url: tracksUrl, text: "Tracks"},
            {url: variantsUrl, text: "Variants"},
            {url: genesUrl, text: "Genes"},
            {url: diseasesUrl, text: "Diseases"},
            {url: metadataUrl, text: "Metadata"},
            {url: phenopacketsUrl, text: "Phenopackets JSON"},
        ];

        const selectedKeys = matchingMenuKeys(individualMenu, urlPath(BENTO_URL));

        const headerTitle = (individual) => {
            if (!individual) {
                return null;
            }
            const mainId = individual.id;
            const alternateIds = individual.alternate_ids ?? [];
            return alternateIds.length ? `${mainId} (${alternateIds.join(", ")})` : mainId;
        };

        return <>
            <SitePageHeader title={headerTitle(individual) || "Loading..."}
                            withTabBar={true}
                            onBack={this.state.backUrl
                                ? (() => this.props.history.push(this.state.backUrl)) : undefined}
                            footer={
                                <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                                    {individualMenu.map(renderMenuItem)}
                                </Menu>
                            } />
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    {(individual && !individualInfo.isFetching) ? <Switch>
                        <Route path={overviewUrl.replace(":", "\\:")}>
                            <IndividualOverview individual={individual} />
                        </Route>
                        <Route path={phenotypicFeaturesUrl.replace(":", "\\:")}>
                            <IndividualPhenotypicFeatures individual={individual} />
                        </Route>
                        <Route path={biosamplesUrl.replace(":", "\\:")}>
                            <IndividualBiosamples individual={individual} experimentsUrl={experimentsUrl} />
                        </Route>
                        <Route path={experimentsUrl.replace(":", "\\:")}>
                            <IndividualExperiments individual={individual} />
                        </Route>
                        <Route path={tracksUrl.replace(":", "\\:")}>
                            <IndividualTracks individual={individual} />
                        </Route>
                        <Route path={variantsUrl.replace(":", "\\:")}>
                            <IndividualVariants individual={individual} tracksUrl={tracksUrl}/>
                        </Route>
                        <Route path={genesUrl.replace(":", "\\:")}>
                            <IndividualGenes individual={individual} tracksUrl={tracksUrl} />
                        </Route>
                        <Route path={diseasesUrl.replace(":", "\\:")}>
                            <IndividualDiseases individual={individual} />
                        </Route>
                        <Route path={metadataUrl.replace(":", "\\:")}>
                            <IndividualMetadata individual={individual} />
                        </Route>
                        <Route path={phenopacketsUrl.replace(":", "\\:")}>
                            <IndividualPhenopackets individual={individual} />
                        </Route>
                        <Redirect to={overviewUrl.replace(":", "\\:")} />
                    </Switch> : <Skeleton />}
                </Layout.Content>
            </Layout>
        </>;
    }
}

ExplorerIndividualContent.propTypes = {
    metadataService: PropTypes.object,  // TODO
    individuals: PropTypes.objectOf(individualPropTypesShape),

    fetchIndividualIfNecessary: PropTypes.func,

    location: ReactRouterPropTypes.location.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
};

const mapStateToProps = state => ({
    metadataService: state.services.metadataService,
    individuals: state.individuals.itemsByID,
});

export default connect(mapStateToProps, {fetchIndividualIfNecessary})(ExplorerIndividualContent);
