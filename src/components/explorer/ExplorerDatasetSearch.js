import React, { useEffect } from "react";
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

import IndividualsTable from "./IndividualsTable";
import BiosamplesTable from "./BiosamplesTable";
import ExperimentsTable from "./ExperimentsTable";

const { TabPane } = Tabs;

const TAB_KEYS = {
    INDIVIDUAL: "1",
    BIOSAMPLES: "2",
    EXPERIMENTS: "3",
};

const hasNonEmptyArrayProperty = (targetObject, propertyKey) => {
    return targetObject && Array.isArray(targetObject[propertyKey]) && targetObject[propertyKey].length;
};

const ExplorerDatasetSearch = () => {
    const { dataset } = useParams();
    const dispatch = useDispatch();

    const datasetsByID = useSelector((state) =>
        Object.fromEntries(
            state.projects.items.flatMap((p) => p.datasets.map((d) => [d.identifier, { ...d, project: p.identifier }])),
        ),
    );

    const activeKey = useSelector((state) => state.explorer.activeTabByDatasetID[dataset]) || TAB_KEYS.INDIVIDUAL;
    const dataTypeForms = useSelector((state) => state.explorer.dataTypeFormsByDatasetID[dataset] || []);
    const fetchingSearch = useSelector((state) => state.explorer.fetchingSearchByDatasetID[dataset] || false);
    const fetchingTextSearch = useSelector((state) => state.explorer.fetchingTextSearch || false);
    const searchResults = useSelector((state) => state.explorer.searchResultsByDatasetID[dataset] || null);

    console.debug("search results: ", searchResults);

    const handleSetSelectedRows = (...args) => dispatch(setSelectedRows(dataset, ...args));

    useEffect(() => {
        // Ensure user is at the top of the page after transition
        window.scrollTo(0, 0);
    }, []);

    const onTabChange = (newActiveKey) => {
        dispatch(setActiveTab(dataset, newActiveKey));
        handleSetSelectedRows([]);
    };

    const performSearch = () => {
        dispatch(setActiveTab(dataset, TAB_KEYS.INDIVIDUAL));
        dispatch(resetTableSortOrder(dataset));
        dispatch(performSearchIfPossible(dataset));
    };

    if (!dataset) return null;

    const selectedDataset = datasetsByID[dataset];

    if (!selectedDataset) return null;

    const isFetchingSearchResults = fetchingSearch || fetchingTextSearch;

    const hasResults = searchResults && searchResults.searchFormattedResults;
    const hasExperiments = hasNonEmptyArrayProperty(searchResults, "searchFormattedResultsExperiment");
    const hasBiosamples = hasNonEmptyArrayProperty(searchResults, "searchFormattedResultsBiosamples");
    const showTabs = hasResults && (hasExperiments || hasBiosamples);

    return (
        <>
            <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
            <SearchAllRecords datasetID={dataset} />
            <DiscoveryQueryBuilder
                isInternal={true}
                dataTypeForms={dataTypeForms}
                onSubmit={performSearch}
                searchLoading={fetchingSearch}
                addDataTypeQueryForm={(form) => dispatch(addDataTypeQueryForm(dataset, form))}
                updateDataTypeQueryForm={(index, form) => dispatch(updateDataTypeQueryForm(dataset, index, form))}
                removeDataTypeQueryForm={(index) => dispatch(removeDataTypeQueryForm(dataset, index))}
            />
            {hasResults &&
                !isFetchingSearchResults &&
                (showTabs ? (
                    <Tabs defaultActiveKey={TAB_KEYS.INDIVIDUAL} onChange={onTabChange} activeKey={activeKey}>
                        <TabPane tab="Individual" key={TAB_KEYS.INDIVIDUAL}>
                            <IndividualsTable
                                data={searchResults.searchFormattedResults}
                                datasetID={dataset}/>
                        </TabPane>
                        {hasBiosamples && (
                            <TabPane tab="Biosamples" key={TAB_KEYS.BIOSAMPLES}>
                                <BiosamplesTable
                                    data={searchResults.searchFormattedResultsBiosamples}
                                    datasetID={dataset}/>
                            </TabPane>
                        )}
                        {hasExperiments && (
                            <TabPane tab="Experiments" key={TAB_KEYS.EXPERIMENTS}>
                                <ExperimentsTable
                                    data={searchResults.searchFormattedResultsExperiment}
                                    datasetID={dataset}/>
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
