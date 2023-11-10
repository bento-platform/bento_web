import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { Descriptions } from "antd";
import { individualPropTypesShape, medicalActionPropTypesShape } from "../../propTypes";
import { useIndividualPhenopacketDataIndex } from "./utils";
import OntologyTerm from "./OntologyTerm";
import { EM_DASH } from "../../constants";
import ReactJson from "react-json-view";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";

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
    const expandedRowRender = useCallback(
        (medicalAction) => (
            <MedicalActionDetails
                medicalAction={medicalAction}
                resourcesTuple={resourcesTuple}
            />
        ), [],
    );
    return (
        <RoutedIndividualContentTable
            data={medicalActions}
            urlParam="selectedMedicalAction"
            columns={MEDICAL_ACTIONS_COLUMS}
            rowKey="idx"
            handleRowSelect={handleMedicalActionClick}
            expandedRowRender={expandedRowRender}
        />
    );
};
MedicalActions.propTypes = {
    medicalActions: PropTypes.array,
    resourcesTuple: PropTypes.array,
    handleMedicalActionClick: PropTypes.func,
};


const IndividualMedicalActions = ({individual}) => {
    const medicalActions = useIndividualPhenopacketDataIndex(individual, "medical_actions");
    return (
        <RoutedIndividualContent
            individual={individual}
            data={medicalActions}
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
