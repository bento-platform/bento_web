import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

import { Descriptions, Table } from "antd";
import { Route, Switch, useHistory, useParams, useRouteMatch } from "react-router-dom/cjs/react-router-dom.min";
import { individualPropTypesShape, medicalActionPropTypesShape } from "../../propTypes";
import { useIndividualPhenopacketDataIndex, useIndividualResources } from "./utils";
import OntologyTerm from "./OntologyTerm";
import { EM_DASH } from "../../constants";
import ReactJson from "react-json-view";

const ACTION_TYPES = {
    "procedure": "Procedure",
    "treatment": "Treatment",
    "radiation_therapy": "Radiation Therapy",
    "therapeutic_regimen": "Therapeutic Regimen",
};

const getMedicalActionType = (medicalAction) => {
    for (const [actionType, actionName] of Object.entries(ACTION_TYPES)) {
        if (medicalAction.hasOwnProperty(actionType)) {
            return {
                type: actionType,
                name: actionName,
            };
        }
    }
    return {
        type: null,
        name: "Unkwown",
    };
};

const MEDICAL_ACTIONS_COLUMS = [
    {
        title: "Medical Action",
        dataIndex: "idx",
    },
    {
        title: "Action Type",
        key: "action",
        render: (_, medicalAction) => {
            return getMedicalActionType(medicalAction).name;
        },
    },
];

const MedicalActionDetails = ({medicalAction, resourcesTuple}) => {
    const actionType = getMedicalActionType(medicalAction);

    // The action is the only field always present, other fields are optional.
    return (
        <Descriptions bordered={true} column={1} size="small">
            <Descriptions.Item label={actionType.name}>
                {/* TODO:  action type specific components ?*/}
                <ReactJson src={medicalAction?.[actionType.type] ?? []}
                           collapsed={false}
                           displayDataTypes={false}
                           name={false}
                />
            </Descriptions.Item>
            {medicalAction?.treatment_target && <Descriptions.Item label="Treatment Target">
                <OntologyTerm resourcesTuple={resourcesTuple} term={medicalAction.treatment_target}/>
            </Descriptions.Item>}
            {medicalAction?.treatment_intent && <Descriptions.Item label="Treatment Intent">
                <OntologyTerm resourcesTuple={resourcesTuple} term={medicalAction.treatment_intent}/>
            </Descriptions.Item>}
            {medicalAction?.response_to_treatment && <Descriptions.Item label="Response To Treatment">
                <OntologyTerm resourcesTuple={resourcesTuple} term={medicalAction.response_to_treatment}/>
            </Descriptions.Item>}
            {medicalAction?.adverse_events && <Descriptions.Item label="Adverse Events">
                { Array.isArray(medicalAction?.adverse_events) ?
                    medicalAction.adverse_events.map((advEvent, index) =>
                        <OntologyTerm resourcesTuple={resourcesTuple} term={advEvent} key={index}/>)
                    : EM_DASH
                }
            </Descriptions.Item>}
            {medicalAction?.treatment_termination_reason && <Descriptions.Item label="Treatment Termination Reason">
                <OntologyTerm resourcesTuple={resourcesTuple} term={medicalAction.treatment_termination_reason}/>
            </Descriptions.Item>}
        </Descriptions>
    );
};
MedicalActionDetails.propTypes = {
    medicalAction: medicalActionPropTypesShape,
    resourcesTuple: PropTypes.array,
};

const MedicalActions = ({medicalActions, resourcesTuple, handleMedicalActionClick}) => {
    const { selectedMedicalAction } = useParams();
    const selectedRowKeys = useMemo(
        () => selectedMedicalAction ? [selectedMedicalAction] : [],
        [selectedMedicalAction],
    );

    const onExpand = useCallback(
        (e, medicalAction) => {
            const index = medicalActions.indexOf(medicalAction);
            const indexStr = ( e && index >= 0 ) ? `${index}` : undefined;
            handleMedicalActionClick(indexStr);
        },
        [handleMedicalActionClick, medicalActions],
    );

    const expandedRowRender = useCallback(
        (medicalAction) => (
            <MedicalActionDetails
                medicalAction={medicalAction}
                resourcesTuple={resourcesTuple}
            />
        ), [],
    );

    return (
        <Table
            bordered={true}
            pagination={false}
            size="small"
            columns={MEDICAL_ACTIONS_COLUMS}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={expandedRowRender}
            dataSource={medicalActions}
            rowKey="idx"
        />
    );
};
MedicalActions.propTypes = {
    medicalActions: PropTypes.array,
    resourcesTuple: PropTypes.array,
    handleMedicalActionClick: PropTypes.func,
};

export const RoutedIndividualContent = ({individual, individualDataHook, dataField, renderContent, urlParam}) => {
    const history = useHistory();
    const match = useRouteMatch();

    const resourcesTuple = useIndividualResources(individual);
    const data = individualDataHook(individual, dataField);

    const handleRoutedSelection = useCallback((selected) => {
        if (!selected) {
            history.replace(match.url);
            return;
        }
        history.replace(`${match.url}/${selected}`);
    });

    const contentNode = useMemo(() => renderContent({
        "data": data,
        "onContentSelect": handleRoutedSelection,
        "resourcesTuple": resourcesTuple,
    }), [data, handleRoutedSelection, resourcesTuple]);

    return (
        <Switch>
            <Route path={`${match.path}/:${urlParam}`}>{contentNode}</Route>
            <Route path={match.path}>{contentNode}</Route>
        </Switch>
    );
};
RoutedIndividualContent.propTypes = {
    individual: individualPropTypesShape,
    individualDataHook: PropTypes.func,
    dataField: PropTypes.string,
    renderContent: PropTypes.func,
    urlParam: PropTypes.string,
};

const IndividualMedicalActions = ({individual}) => {
    return (
        <RoutedIndividualContent
            individual={individual}
            individualDataHook={useIndividualPhenopacketDataIndex}
            dataField="medical_actions"
            urlParam="selectedMedicalAction"
            renderContent={({data, onContentSelect, resourcesTuple}) => (
                <MedicalActions
                    medicalActions={data}
                    resourcesTuple={resourcesTuple}
                    handleMedicalActionClick={onContentSelect}
                />
            )}
        />
    );
};

IndividualMedicalActions.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualMedicalActions;
