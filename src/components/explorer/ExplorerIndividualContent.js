import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

import { Layout, Menu, Skeleton } from "antd";

import { BENTO_URL } from "../../config";
import { fetchIndividualIfNecessary } from "../../modules/metadata/actions";
import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";
import { matchingMenuKeys, renderMenuItem } from "../../utils/menu";
import { urlPath } from "../../utils/url";
import { useIsDataEmpty, useDeduplicatedIndividualBiosamples, useIndividualResources } from "./utils";

import SitePageHeader from "../SitePageHeader";
import IndividualOverview from "./IndividualOverview";
import IndividualPhenotypicFeatures from "./IndividualPhenotypicFeatures";
import IndividualBiosamples from "./IndividualBiosamples";
import IndividualExperiments from "./IndividualExperiments";
import IndividualDiseases from "./IndividualDiseases";
import IndividualOntologies from "./IndividualOntologies";
import IndividualTracks from "./IndividualTracks";
import IndividualPhenopackets from "./IndividualPhenopackets";
import IndividualInterpretations from "./IndividualInterpretations";
import { setIndividualId, setIndividualResourcesTuple } from "../../modules/explorer/actions";
import IndividualMedicalActions from "./IndividualMedicalActions";
import IndividualMeasurements from "./IndividualMeasurements";

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px",
};

const headerTitle = (individual) => {
    if (!individual) {
        return null;
    }
    const mainId = individual.id;
    const alternateIds = individual.alternate_ids ?? [];
    return alternateIds.length ? `${mainId} (${alternateIds.join(", ")})` : mainId;
};

const ExplorerIndividualContent = () => {
    const dispatch = useDispatch();

    const location = useLocation();
    const history = useHistory();
    const { individual: individualID } = useParams();
    const { url: individualUrl } = useRouteMatch();

    const [backUrl, setBackUrl] = useState(undefined);

    useEffect(() => {
        const b = location.state?.backUrl;
        if (b) {
            setBackUrl(b);
        }
    }, [location]);

    useEffect(() => {
        if (individualID) {
            dispatch(setIndividualId(individualID));
        }
    }, [dispatch, individualID]);

    const metadataService = useSelector((state) => state.services.metadataService);
    const individuals = useSelector((state) => state.individuals.itemsByID);

    useEffect(() => {
        if (metadataService && individualID) {
            // If we've loaded the metadata service, and we have an individual selected (or the individual ID changed),
            // we should load individual data.
            dispatch(fetchIndividualIfNecessary(individualID));
        }
    }, [dispatch, metadataService, individualID]);

    const { isFetching: individualIsFetching, data: individual } = individuals[individualID] ?? {};

    const resources = useIndividualResources(individual);
    useEffect(() => {
        // Set individual resources in the store for OntologyTerm rendering with no prop drilling
        if (resources) {
            dispatch(setIndividualResourcesTuple(resources));
        }
    }, [dispatch, resources]);

    const overviewUrl = `${individualUrl}/overview`;
    const phenotypicFeaturesUrl = `${individualUrl}/phenotypic-features`;
    const biosamplesUrl = `${individualUrl}/biosamples`;
    const experimentsUrl = `${individualUrl}/experiments`;
    const diseasesUrl = `${individualUrl}/diseases`;
    const ontologiesUrl = `${individualUrl}/ontologies`;
    const tracksUrl = `${individualUrl}/tracks`;
    const phenopacketsUrl = `${individualUrl}/phenopackets`;
    const interpretationsUrl = `${individualUrl}/interpretations`;
    const medicalActionsUrl = `${individualUrl}/medical-actions`;
    const measurementsUrl = `${individualUrl}/measurements`;

    const individualPhenopackets = individual?.phenopackets ?? [];
    const individualMenu = [
        {url: overviewUrl, style: {marginLeft: "4px"}, text: "Overview"},
        {
            url: phenotypicFeaturesUrl,
            text: "Phenotypic Features",
            disabled: useIsDataEmpty(individualPhenopackets, "phenotypic_features"),
        },
        {
            url: biosamplesUrl,
            text: "Biosamples",
            disabled: useIsDataEmpty(individualPhenopackets, "biosamples"),
        },
        {
            url: experimentsUrl,
            text: "Experiments",
            disabled: useIsDataEmpty(
                useDeduplicatedIndividualBiosamples(individual),
                "experiments",
            ),
        },
        {
            url: interpretationsUrl,
            text: "Interpretations",
            disabled: useIsDataEmpty(individualPhenopackets, "interpretations"),
        },
        {url: tracksUrl, text: "Tracks"},
        {
            url: diseasesUrl,
            text: "Diseases",
            disabled: useIsDataEmpty(individualPhenopackets, "diseases"),
        },
        {url: ontologiesUrl, text: "Ontologies"},
        {
            url: medicalActionsUrl,
            text: "Medical Actions",
            disabled: useIsDataEmpty(individualPhenopackets, "medical_actions"),
        },
        {
            url: measurementsUrl,
            text: "Measurements",
            disabled: useIsDataEmpty(individualPhenopackets, "measurements"),
        },
        {url: phenopacketsUrl, text: "Phenopackets JSON"},
    ];
    const selectedKeys = matchingMenuKeys(individualMenu, urlPath(BENTO_URL));

    return <>
        <SitePageHeader
            title={headerTitle(individual) || "Loading..."}
            withTabBar={true}
            onBack={backUrl ? (() => {
                history.push(backUrl);
                setBackUrl(undefined);  // Clear back button if we use it
            }) : undefined}
            footer={
                <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                    {individualMenu.map(renderMenuItem)}
                </Menu>
            }
        />
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                {(individual && !individualIsFetching) ? <Switch>
                    <Route path={overviewUrl.replace(":", "\\:")}>
                        <IndividualOverview individual={individual} />
                    </Route>
                    <Route path={phenotypicFeaturesUrl.replace(":", "\\:")}>
                        <IndividualPhenotypicFeatures individual={individual} />
                    </Route>
                    <Route path={biosamplesUrl.replace(":", "\\:")}>
                        <IndividualBiosamples individual={individual} experimentsUrl={experimentsUrl}/>
                    </Route>
                    <Route path={experimentsUrl.replace(":", "\\:")}>
                        <IndividualExperiments individual={individual} />
                    </Route>
                    <Route path={interpretationsUrl.replace(":", "\\:")}>
                        <IndividualInterpretations individual={individual} />
                    </Route>
                    <Route path={tracksUrl.replace(":", "\\:")}>
                        <IndividualTracks individual={individual} />
                    </Route>
                    <Route path={diseasesUrl.replace(":", "\\:")}>
                        <IndividualDiseases individual={individual} />
                    </Route>
                    <Route path={ontologiesUrl.replace(":", "\\:")}>
                        <IndividualOntologies individual={individual} />
                    </Route>
                    <Route path={medicalActionsUrl.replace(":", "\\:")}>
                        <IndividualMedicalActions individual={individual}/>
                    </Route>
                    <Route path={measurementsUrl.replace(":", "\\:")}>
                        <IndividualMeasurements individual={individual} />
                    </Route>
                    <Route path={phenopacketsUrl.replace(":", "\\:")}>
                        <IndividualPhenopackets individual={individual} />
                    </Route>
                    <Redirect to={overviewUrl.replace(":", "\\:")} />
                </Switch> : <Skeleton loading={true} />}
            </Layout.Content>
        </Layout>
    </>;
};

export default ExplorerIndividualContent;
