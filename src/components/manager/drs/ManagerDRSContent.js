import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";

import { filesize } from "filesize";
import { throttle } from "lodash";

import { Layout, Input, Table, Descriptions, Space, Button, Modal, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { RESOURCE_EVERYTHING, deleteData, downloadData, queryData } from "bento-auth-js";

import { EM_DASH } from "@/constants";
import { LAYOUT_CONTENT_STYLE } from "@/styles/layoutContent";

import BooleanYesNo from "@/components/common/BooleanYesNo";
import DownloadButton from "@/components/common/DownloadButton";
import MonospaceText from "@/components/common/MonospaceText";
import ForbiddenContent from "@/components/ForbiddenContent";
import { useResourcePermissionsWrapper } from "@/hooks";
import { clearDRSObjectSearch, deleteDRSObject, performDRSObjectSearch } from "@/modules/drs/actions";
import DatasetTitleDisplay from "../DatasetTitleDisplay";
import ProjectTitleDisplay from "../ProjectTitleDisplay";
import { useProjects } from "@/modules/metadata/hooks";
import { useService } from "@/modules/services/hooks";

const TABLE_NESTED_DESCRIPTIONS_STYLE = {
    backgroundColor: "white",
    borderRadius: 3,
    maxWidth: 1400,
};

const PROP_TYPES_DRS_OBJECT = PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    size: PropTypes.number,
    checksums: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
        checksum: PropTypes.string.isRequired,
    })),
    access_methods: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
        access_url: PropTypes.shape({ url: PropTypes.string }),
    })),
    bento: PropTypes.shape({
        project_id: PropTypes.string,
        dataset_id: PropTypes.string,
        data_type: PropTypes.string,
        public: PropTypes.bool,
    }),
});

const DRSObjectDetail = ({ drsObject }) => {
    const { id, description, checksums, access_methods: accessMethods, size, bento } = drsObject;
    return (
        <div style={TABLE_NESTED_DESCRIPTIONS_STYLE} className="table-nested-ant-descriptions">
            <Descriptions bordered={true}>
                <Descriptions.Item label="ID" span={2}>
                    <MonospaceText>{id}</MonospaceText>
                </Descriptions.Item>
                <Descriptions.Item label="Size" span={1}>
                    {filesize(size)}
                </Descriptions.Item>
                {description && (
                    <Descriptions.Item label="Description" span={3}>
                        {description}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Checksums" span={3}>
                    {checksums.map(({ type, checksum }) => (
                        <div
                            key={type}
                            style={{ display: "flex", gap: "0.8em", alignItems: "baseline" }}
                        >
                            <span style={{ fontWeight: "bold" }}>{type.toLocaleUpperCase()}:</span>
                            <MonospaceText>{checksum}</MonospaceText>
                        </div>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Access Methods" span={2}>
                    {accessMethods.map(({ type, access_url: url }, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.8em", alignItems: "baseline" }}>
                            <span style={{ fontWeight: "bold" }}>{type.toLocaleUpperCase()}:</span>
                            <MonospaceText>
                                {["http", "https"].includes(type) ? (  // "http" for back-compat
                                    <a href={url?.url} target="_blank" rel="noreferrer">
                                        {url?.url}
                                    </a>
                                ) : (
                                    url?.url
                                )}
                            </MonospaceText>
                        </div>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Public" span={1}>
                    <BooleanYesNo value={bento?.public} />
                </Descriptions.Item>
                <Descriptions.Item label="Project" span={1}>
                    <ProjectTitleDisplay projectID={bento?.project_id} link={true} />
                </Descriptions.Item>
                <Descriptions.Item label="Dataset" span={1}>
                    <DatasetTitleDisplay datasetID={bento?.dataset_id} link={true} />
                </Descriptions.Item>
                <Descriptions.Item label="Data Type" span={1}>
                    {bento?.data_type ?? EM_DASH}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
};
DRSObjectDetail.propTypes = {
    drsObject: PROP_TYPES_DRS_OBJECT,
};

const DRSObjectDeleteWarningParagraph = memo(({ plural }) => (
    <Typography.Paragraph>
        Be careful that there are no extant references to {plural ? "these objects" : "this object"} anywhere in the
        instance. If there are, triggering this will result in broken links and possibly broken functionality!
    </Typography.Paragraph>
));
DRSObjectDeleteWarningParagraph.propTypes = { plural: PropTypes.bool };

const DRSObjectDeleteButton = ({ drsObject, disabled }) => {
    const dispatch = useDispatch();

    const onClick = useCallback(() => {
        Modal.confirm({
            title: <>Are you sure you wish to delete DRS object &ldquo;{drsObject.name}&rdquo;?</>,
            content: <DRSObjectDeleteWarningParagraph plural={false} />,
            okButtonProps: { danger: true },
            onOk() {
                return dispatch(deleteDRSObject(drsObject));
            },
            maskClosable: true,
        });
    }, [dispatch, drsObject]);

    return (
        <Button size="small" danger={true} icon={<DeleteOutlined />} onClick={onClick} disabled={disabled}>
            Delete</Button>
    );
};
DRSObjectDeleteButton.propTypes = {
    drsObject: PROP_TYPES_DRS_OBJECT,
    disabled: PropTypes.bool,
};

const SEARCH_CONTAINER_STYLE = {
    flex: 1,
    maxWidth: 800,
};

// noinspection JSUnusedGlobalSymbols
const DRS_TABLE_EXPANDABLE = {
    expandedRowRender: (drsObject) => <DRSObjectDetail drsObject={drsObject} />,
};

const ManagerDRSContent = () => {
    const dispatch = useDispatch();

    const { itemsByID: projectsByID, datasetsByID } = useProjects();

    // TODO: per-object permissions
    //  For now, use whole-node permissions for DRS object viewer

    // TODO: delete permissions:
    //  - disable bulk button if any cannot be deleted
    //  - map to resources and get back delete permissions for returned objects

    const {
        permissions,
        isFetchingPermissions,
        hasAttemptedPermissions,
    } = useResourcePermissionsWrapper(RESOURCE_EVERYTHING);

    const hasQueryPermission = permissions.includes(queryData);
    const hasDownloadPermission = permissions.includes(downloadData);
    const hasDeletePermission = permissions.includes(deleteData);

    const drsURL = useService("drs")?.url;
    const {
        objectSearchResults: rawObjectResults,
        objectSearchIsFetching,
        objectSearchAttempted,
    } = useSelector((state) => state.drs);

    const objectResults = useMemo(() => rawObjectResults.map((o) => {
        const projectID = o.bento?.project_id;
        const datasetID = o.bento?.dataset_id;

        const projectValid = !projectID || !!projectsByID[projectID];
        const datasetValid = !datasetID || !!datasetsByID[datasetID];

        return { ...o, valid_resource: projectValid && datasetValid };
    }), [rawObjectResults, projectsByID, datasetsByID]);

    const objectsByID = useMemo(
        () => Object.fromEntries(objectResults.map((o) => [o.id, o])),
        [objectResults]);

    const [searchParams, setSearchParams] = useSearchParams();
    const { q: initialSearchQuery } = searchParams;
    const [searchValue, setSearchValue] = useState(initialSearchQuery ?? "");
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const onSearch = useCallback((e) => {
        const q = (e.target?.value ?? e ?? "").trim();
        setSearchValue(q);
        setSearchParams({ q });
    }, [setSearchParams]);

    const performSearch = useMemo(() => throttle(
        () => {
            if (!drsURL) return;

            if (!searchValue) {
                // Behave as if we have never searched before
                dispatch(clearDRSObjectSearch());
                return;
            }

            dispatch(performDRSObjectSearch(searchValue)).catch((err) => console.error(err));
        },
        300,
        { leading: true, trailing: true },
    ), [dispatch, drsURL, searchValue]);

    useEffect(() => {
        performSearch();
    }, [searchValue, performSearch]);

    useEffect(() => {
        setSelectedRowKeys(selectedRowKeys.filter((k) => k in objectsByID));
    }, [selectedRowKeys, objectsByID]);

    const onDeleteSelected = useCallback(() => {
        Modal.confirm({
            title: <>
                Are you sure you want to delete {selectedRowKeys.length} DRS
                object{selectedRowKeys.length === 1 ? "" : "s"}?
            </>,
            content: <DRSObjectDeleteWarningParagraph plural={selectedRowKeys.length !== 1} />,
            onOk() {
                return (async () => {
                    for (const k of selectedRowKeys) {
                        if (!(k in objectsByID)) {
                            console.warn("Missing DRS object record in search results for ID:", k);
                            continue;
                        }

                        console.info("Deleting DRS object:", k);
                        await dispatch(deleteDRSObject(objectsByID[k]));
                    }
                })();
            },
            maskClosable: true,
        });
    }, [dispatch, selectedRowKeys, objectsByID]);

    const tableLocale = useMemo(
        () => ({
            emptyText: objectSearchAttempted ? "No matching objects" : "Search to see matching objects",
        }),
        [objectSearchAttempted],
    );

    // noinspection JSUnusedGlobalSymbols
    const columns = useMemo(() => [
        {
            title: "URI",
            dataIndex: "self_uri",
            render: (selfUri) => <MonospaceText>{selfUri}</MonospaceText>,
        },
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Size",
            dataIndex: "size",
            render: (size) => filesize(size),
        },
        {
            title: "Valid Resource?",
            dataIndex: "valid_resource",
            filters: [
                { text: "Yes", value: true },
                { text: "No", value: false },
            ],
            onFilter: (value, record) => record.valid_resource === value,
            render: (v) => <BooleanYesNo value={v} />,
        },
        {
            title: "Actions",
            dataIndex: "",
            key: "actions",
            width: 208,
            render: (record) => {
                const url = record.access_methods[0]?.access_url?.url;
                return (
                    <Space>
                        <DownloadButton
                            disabled={!hasDownloadPermission || !url}
                            uri={url}
                            fileName={record.name}
                            size="small"
                        />
                        <DRSObjectDeleteButton drsObject={record} disabled={!hasDeletePermission} />
                    </Space>
                );
            },
        },
    ], [hasDownloadPermission, hasDeletePermission, projectsByID, datasetsByID]);

    // noinspection JSUnusedGlobalSymbols
    const rowSelection = useMemo(() => ({
        type: "checkbox",
        getCheckboxProps: (record) => ({ name: record.id }),
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    }), [selectedRowKeys]);

    if (hasAttemptedPermissions && !hasQueryPermission) {
        return (
            <ForbiddenContent message="You do not have permission to view DRS objects." />
        );
    }

    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <div style={{ marginBottom: "1rem", display: "flex", gap: 16 }}>
                    <div style={SEARCH_CONTAINER_STYLE}>
                        <Input.Search
                            placeholder="Search DRS objects by name."
                            loading={isFetchingPermissions || objectSearchIsFetching || !drsURL}
                            disabled={!drsURL}
                            onChange={onSearch}
                            onSearch={onSearch}
                            value={searchValue}
                            // size="large"
                        />
                    </div>
                    <Button
                        icon={<DeleteOutlined />}
                        danger={true}
                        onClick={onDeleteSelected}
                        disabled={selectedRowKeys.length === 0}
                    >Delete Selected{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ""}</Button>
                </div>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={objectResults}
                    loading={isFetchingPermissions || objectSearchIsFetching}
                    bordered={true}
                    size="middle"
                    expandable={DRS_TABLE_EXPANDABLE}
                    locale={tableLocale}
                    rowSelection={rowSelection}
                />
            </Layout.Content>
        </Layout>
    );
};

export default ManagerDRSContent;
