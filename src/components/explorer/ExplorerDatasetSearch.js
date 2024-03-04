import React, { useCallback, useEffect, useMemo } from "react";
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
    resetTableSortOrder,
    setActiveTab,
} from "../../modules/explorer/actions";

import IndividualsTable from "./searchResultsTables/IndividualsTable";
import BiosamplesTable from "./searchResultsTables/BiosamplesTable";
import ExperimentsTable from "./searchResultsTables/ExperimentsTable";
import {fetchDatasetResourcesIfNecessary} from "../../modules/datasets/actions";

const TAB_KEYS = {
    INDIVIDUAL: "1",
    BIOSAMPLES: "2",
    EXPERIMENTS: "3",
};

const hasNonEmptyArrayProperty = (targetObject, propertyKey) => {
    return targetObject && Array.isArray(targetObject[propertyKey]) && targetObject[propertyKey].length;
};

const ExplorerDatasetSearch = () => {
    const { dataset: datasetID } = useParams();
    const dispatch = useDispatch();

    const datasetsByID = useSelector((state) => state.projects.datasetsByID);

    const activeKey = useSelector((state) => state.explorer.activeTabByDatasetID[datasetID]) || TAB_KEYS.INDIVIDUAL;
    const dataTypeForms = useSelector((state) => state.explorer.dataTypeFormsByDatasetID[datasetID] || []);
    const fetchingSearch = useSelector((state) => state.explorer.fetchingSearchByDatasetID[datasetID] || false);
    const fetchingTextSearch = useSelector((state) => state.explorer.fetchingTextSearch || false);
    const searchResults = useSelector((state) => state.explorer.searchResultsByDatasetID[datasetID] || null);

    useEffect(() => {
        console.debug("search results: ", searchResults);
    }, [searchResults]);

    const handleSetSelectedRows = useCallback(
        (...args) => dispatch(setSelectedRows(datasetID, ...args)),
        [dispatch, datasetID],
    );

    useEffect(() => {
        // Ensure user is at the top of the page after transition
        window.scrollTo(0, 0);
    }, []);

    const onTabChange = useCallback((newActiveKey) => {
        dispatch(setActiveTab(datasetID, newActiveKey));
        handleSetSelectedRows([]);
    }, [dispatch, datasetID, handleSetSelectedRows]);

    const performSearch = useCallback(() => {
        dispatch(setActiveTab(datasetID, TAB_KEYS.INDIVIDUAL));
        dispatch(resetTableSortOrder(datasetID));
        dispatch(performSearchIfPossible(datasetID));
    }, [dispatch, datasetID]);

    useEffect(() => {
        dispatch(fetchDatasetResourcesIfNecessary(datasetID));
    }, [dispatch, datasetID]);

    const selectedDataset = datasetsByID[datasetID];

    const isFetchingSearchResults = fetchingSearch || fetchingTextSearch;

    const hasResults = searchResults && searchResults.searchFormattedResults;
    const hasExperiments = hasNonEmptyArrayProperty(searchResults, "searchFormattedResultsExperiment");
    const hasBiosamples = hasNonEmptyArrayProperty(searchResults, "searchFormattedResultsBiosamples");
    const showTabs = hasResults && (hasExperiments || hasBiosamples);

    const tabItems = useMemo(() => searchResults ? [
        {
            key: TAB_KEYS.INDIVIDUAL,
            label: `Individuals (${searchResults.searchFormattedResults.length})`,
            children: (
                <IndividualsTable
                    data={searchResults.searchFormattedResults}
                    datasetID={datasetID}
                />
            ),
        },
        ...(hasBiosamples ? [{
            key: TAB_KEYS.BIOSAMPLES,
            label: `Biosamples (${searchResults.searchFormattedResultsBiosamples.length})`,
            children: (
                <BiosamplesTable
                    data={searchResults.searchFormattedResultsBiosamples}
                    datasetID={datasetID}
                />
            ),
        }] : []),
        ...(hasExperiments ? [{
            key: TAB_KEYS.EXPERIMENTS,
            label: `Experiments (${searchResults.searchFormattedResultsExperiment.length})`,
            children: (
                <ExperimentsTable
                    data={searchResults.searchFormattedResultsExperiment}
                    datasetID={datasetID}
                />
            ),
        }] : []),
    ] : [], [searchResults, datasetID]);

    if (!selectedDataset) return null;
    return (
        <>
            <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
            <SearchAllRecords datasetID={datasetID} />
            <DiscoveryQueryBuilder
                activeDataset={datasetID}
                isInternal={true}
                dataTypeForms={dataTypeForms}
                onSubmit={performSearch}
                searchLoading={fetchingSearch}
                addDataTypeQueryForm={(form) => dispatch(addDataTypeQueryForm(datasetID, form))}
                updateDataTypeQueryForm={(index, form) => dispatch(updateDataTypeQueryForm(datasetID, index, form))}
                removeDataTypeQueryForm={(index) => dispatch(removeDataTypeQueryForm(datasetID, index))}
            />
            {hasResults &&
                !isFetchingSearchResults &&
                (showTabs ? (
                    <Tabs
                        defaultActiveKey={TAB_KEYS.INDIVIDUAL}
                        onChange={onTabChange}
                        activeKey={activeKey}
                        items={tabItems}
                    />
                ) : (
                    <IndividualsTable data={searchResults.searchFormattedResults} datasetID={datasetID} />
                ))}
        </>
    );
};

export default ExplorerDatasetSearch;
