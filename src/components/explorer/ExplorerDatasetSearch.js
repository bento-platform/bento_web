import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { Typography, Tabs } from "antd";

import "./explorer.css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import SearchAllRecords from "./SearchAllRecords";

import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
} from "../../modules/explorer/actions";

import IndividualsTable from "./IndividualsTable";
import BiosamplesTable from "./BiosamplesTable";
import ExperimentsTable from "./ExperimentsTable";

const { TabPane } = Tabs;

const ExplorerDatasetSearch = () => {
    const [, setCurrentPage] = useState(1);
    const [activeKey, setActiveKey] = useState("1");
    const dispatch = useDispatch();
    const { dataset } = useParams();

    const datasetsByID = useSelector((state) =>
        Object.fromEntries(
            state.projects.items.flatMap((p) => p.datasets.map((d) => [d.identifier, { ...d, project: p.identifier }]))
        )
    );
    const dataTypeForms = useSelector((state) => state.explorer.dataTypeFormsByDatasetID[dataset] || []);
    const fetchingSearch = useSelector((state) => state.explorer.fetchingSearchByDatasetID[dataset] || false);
    const fetchingTextSearch = useSelector((state) => state.explorer.fetchingTextSearch || false);
    const searchResults = useSelector((state) => state.explorer.searchResultsByDatasetID[dataset] || null);
    console.log("search results: ", searchResults);

    const handleSetSelectedRows = (...args) => dispatch(setSelectedRows(dataset, ...args));

    useEffect(() => {
        // Ensure user is at the top of the page after transition
        window.scrollTo(0, 0);
    }, []);

    const onCallback = (activeKey) => {
        setActiveKey(activeKey);
        handleSetSelectedRows([]);
    };

    const resetPageNumber = () => {
        setCurrentPage(1);
        dispatch(performSearchIfPossible(dataset));
    };

    if (!dataset) return null; // TODO

    const selectedDataset = datasetsByID[dataset];

    if (!selectedDataset) return null; // TODO

    const isFetchingSearchResults = fetchingSearch || fetchingTextSearch;

    const hasIndividuals = searchResults && searchResults.searchFormattedResults;
    const hasExperiments = searchResults && searchResults.searchFormattedResultsExperiment;
    const hasBiosamples = searchResults && searchResults.searchFormattedResultsBioSamples;
    const showTabs = hasIndividuals && (hasExperiments || hasBiosamples);

    return (
        <>
            <Typography.Title level={4}>Explore DatasetY {selectedDataset.title}</Typography.Title>
            <SearchAllRecords datasetID={dataset} />
            <DiscoveryQueryBuilder
                isInternal={true}
                dataTypeForms={dataTypeForms}
                onSubmit={resetPageNumber}
                searchLoading={fetchingSearch}
                addDataTypeQueryForm={(form) => dispatch(addDataTypeQueryForm(dataset, form))}
                updateDataTypeQueryForm={(index, form) => dispatch(updateDataTypeQueryForm(dataset, index, form))}
                removeDataTypeQueryForm={(index) => dispatch(removeDataTypeQueryForm(dataset, index))}
            />
            {hasIndividuals &&
                !isFetchingSearchResults &&
                (showTabs ? (
                    <Tabs defaultActiveKey="1" onChange={onCallback} activeKey={activeKey}>
                        <TabPane tab="Individual" key="1">
                            <IndividualsTable data={searchResults.searchFormattedResults} />
                        </TabPane>
                        {hasBiosamples && (
                            <TabPane tab="Biosamples" key="2">
                                <BiosamplesTable data={searchResults.searchFormattedResultsBioSamples} />
                            </TabPane>
                        )}
                        {hasExperiments && (
                            <TabPane tab="Experiments" key="3">
                                <ExperimentsTable data={searchResults.searchFormattedResultsExperiment} />
                            </TabPane>
                        )}
                    </Tabs>
                ) : (
                    <IndividualsTable data={searchResults.searchFormattedResults} />
                ))}
        </>
    );
};

export default ExplorerDatasetSearch;
