import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate, useLocation, useParams } from "react-router-dom";

import { Layout, Menu, Skeleton } from "antd";

import { fetchIndividualIfNecessary } from "@/modules/metadata/actions";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";
import { matchingMenuKeys, transformMenuItem } from "@/utils/menu";

import { ExplorerIndividualContext } from "./contexts/individual";
import {
    useIsDataEmpty,
    useDeduplicatedIndividualBiosamples,
    useIndividualResources,
    explorerIndividualUrl,
} from "./utils";

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
    const navigate = useNavigate();
    const { individual: individualID } = useParams();

    const [backUrl, setBackUrl] = useState(location.state?.backUrl);

    useEffect(() => {
        const b = location.state?.backUrl;
        if (b) {
            setBackUrl(b);
        }
    }, [location]);

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

    const resourcesTuple = useIndividualResources(individual);
    const individualContext = useMemo(() => ({ individualID, resourcesTuple }), [individualID, resourcesTuple]);

    const individualUrl = explorerIndividualUrl(individualID);

    const overviewPath = "overview";
    const phenotypicFeaturesPath = "phenotypic-features";
    const biosamplesPath = "biosamples";
    const experimentsPath = "experiments";
    const diseasesPath = "diseases";
    const ontologiesPath = "ontologies";
    const tracksPath = "tracks";
    const phenopacketsPath = "phenopackets";
    const interpretationsPath = "interpretations";
    const medicalActionsPath = "medical-actions";
    const measurementsPath = "measurements";

    const individualPhenopackets = individual?.phenopackets ?? [];
    const individualMenu = [
        // Overview
        { url: `${individualUrl}/${overviewPath}`, style: {marginLeft: "4px"}, text: "Overview" },
        // Biosamples related menu items
        {
            url: `${individualUrl}/${biosamplesPath}`,
            text: "Biosamples",
            disabled: useIsDataEmpty(individualPhenopackets, "biosamples"),
        },
        {
            url: `${individualUrl}/${measurementsPath}`,
            text: "Measurements",
            disabled: useIsDataEmpty(individualPhenopackets, "measurements"),
        },
        {
            url: `${individualUrl}/${phenotypicFeaturesPath}`,
            text: "Phenotypic Features",
            disabled: useIsDataEmpty(individualPhenopackets, "phenotypic_features"),
        },
        {
            url: `${individualUrl}/${diseasesPath}`,
            text: "Diseases",
            disabled: useIsDataEmpty(individualPhenopackets, "diseases"),
        },
        {
            url: `${individualUrl}/${interpretationsPath}`,
            text: "Interpretations",
            disabled: useIsDataEmpty(individualPhenopackets, "interpretations"),
        },
        {
            url: `${individualUrl}/${medicalActionsPath}`,
            text: "Medical Actions",
            disabled: useIsDataEmpty(individualPhenopackets, "medical_actions"),
        },
        // Experiments related menu items
        {
            url: `${individualUrl}/${experimentsPath}`,
            text: "Experiments",
            disabled: useIsDataEmpty(
                useDeduplicatedIndividualBiosamples(individual),
                "experiments",
            ),
        },
        {url: `${individualUrl}/${tracksPath}`, text: "Tracks"},
        // Extra
        {url: `${individualUrl}/${ontologiesPath}`, text: "Ontologies"},
        {url: `${individualUrl}/${phenopacketsPath}`, text: "Phenopackets JSON"},
    ];
    const selectedKeys = matchingMenuKeys(individualMenu);

    return <>
        <SitePageHeader
            title={headerTitle(individual) || "Loading..."}
            withTabBar={true}
            onBack={backUrl ? (() => {
                navigate(backUrl);
                setBackUrl(undefined);  // Clear back button if we use it
            }) : undefined}
            footer={
                <Menu
                    mode="horizontal"
                    style={MENU_STYLE}
                    selectedKeys={selectedKeys}
                    items={individualMenu.map(transformMenuItem)}
                />
            }
        />
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <ExplorerIndividualContext.Provider value={individualContext}>
                    {(individual && !individualIsFetching) ? <Routes>
                        {/* OVERVIEW */}
                        <Route path={overviewPath} element={<IndividualOverview individual={individual} />} />
                        {/* BIOSAMPLES RELATED */}
                        <Route
                            path={`${biosamplesPath}/*`}
                            element={<IndividualBiosamples individual={individual} />}
                        />
                        <Route path={`${measurementsPath}/*`}
                               element={<IndividualMeasurements individual={individual} />} />
                        <Route path={`${phenotypicFeaturesPath}/*`}
                               element={<IndividualPhenotypicFeatures individual={individual} />} />
                        <Route path={`${diseasesPath}/*`} element={<IndividualDiseases individual={individual} />} />
                        <Route path={`${interpretationsPath}/*`}
                               element={<IndividualInterpretations individual={individual} />} />
                        <Route path={`${medicalActionsPath}/*`}
                               element={<IndividualMedicalActions individual={individual}/>} />
                        {/* EXPERIMENTS RELATED*/}
                        <Route path={`${experimentsPath}/*`}
                               element={<IndividualExperiments individual={individual} />} />
                        <Route path={tracksPath} element={<IndividualTracks individual={individual} />} />
                        {/* EXTRA */}
                        <Route path={ontologiesPath} element={<IndividualOntologies individual={individual} />} />
                        <Route path={phenopacketsPath} element={<IndividualPhenopackets individual={individual} />} />
                        <Route path="*" element={<Navigate to={overviewPath} replace={true} />} />
                    </Routes> : <Skeleton loading={true} />}
                </ExplorerIndividualContext.Provider>
            </Layout.Content>
        </Layout>
    </>;
};

export default ExplorerIndividualContent;
