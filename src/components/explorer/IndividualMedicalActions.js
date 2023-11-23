import React from "react";
import PropTypes from "prop-types";

import { Descriptions, Table } from "antd";
import { individualPropTypesShape, medicalActionPropTypesShape } from "../../propTypes";
import { ontologyTermSorter, useIndividualPhenopacketDataIndex } from "./utils";
import OntologyTerm, { conditionalOntologyRender } from "./OntologyTerm";
import { EM_DASH } from "../../constants";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import TimeElement, { renderTimeInterval } from "./TimeElement";
import { Quantity } from "./IndividualMeasurements";

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
        name: "Unknown",
    };
};

export const Procedure = ({procedure}) => {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Code">
                <OntologyTerm term={procedure.code}/>
            </Descriptions.Item>
            <Descriptions.Item label="Body Site">
                <OntologyTerm term={procedure.body_site}/>
            </Descriptions.Item>
            <Descriptions.Item label="Performed">
                <TimeElement timeElement={procedure.performed}/>
            </Descriptions.Item>
        </Descriptions>
    );
};
Procedure.propTypes = {
    procedure: PropTypes.object,
};

const DOSE_INTERVAL_COLUMNS = [
    {
        title: "Quantity",
        render: (_, doseInterval) => (
            <Quantity
                quantity={doseInterval.quantity}
            />
        ),
    },
    {
        title: "Schedule Frequency",
        render: (_, doseInterval) => (
            <OntologyTerm term={doseInterval.schedule_frequency}/>
        ),
    },
    {
        title: "Interval",
        render: (_, doseInterval) => renderTimeInterval(doseInterval.interval),
    },
];

export const Treatment = ({treatment}) => {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Agent">
                <OntologyTerm term={treatment.agent}/>
            </Descriptions.Item>
            <Descriptions.Item label="Route of Administration">
                <OntologyTerm term={treatment.route_of_administration}/>
            </Descriptions.Item>
            <Descriptions.Item label="Dose Intervals">
                {treatment?.dose_interval ? (
                    <Table
                        bordered={true}
                        pagination={false}
                        size="small"
                        columns={DOSE_INTERVAL_COLUMNS}
                        dataSource={treatment.dose_interval}
                    />
                ) : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Drug Type">{treatment.drug_type}</Descriptions.Item>
            <Descriptions.Item label="Cumulative Dose">
                {treatment?.cumulative_dose ? (
                    <Quantity quantity={treatment.cumulative_dose}/>
                ) : EM_DASH}
            </Descriptions.Item>
        </Descriptions>
    );
};
Treatment.propTypes = {
    treatment: PropTypes.object,
};

export const RadiationTherapy = ({radiationTherapy}) => {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Modality">
                <OntologyTerm term={radiationTherapy.modality}/>
            </Descriptions.Item>
            <Descriptions.Item label="Body Site">
                <OntologyTerm term={radiationTherapy.body_site}/>
            </Descriptions.Item>
            <Descriptions.Item label="Dosage">{radiationTherapy.dosage}</Descriptions.Item>
            <Descriptions.Item label="Fractions">{radiationTherapy.fractions}</Descriptions.Item>
        </Descriptions>
    );
};
RadiationTherapy.propTypes = {
    radiationTherapy: PropTypes.object,
};

export const TherapeuticRegimen = ({therapeuticRegimen}) => {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Identifier">
                {therapeuticRegimen?.ontology_class &&
                    <OntologyTerm term={therapeuticRegimen.ontology_class}/>
                }
                {therapeuticRegimen?.external_reference &&
                    <div style={{"display": "flex", "flexDirection": "column"}}>
                        <div>
                            <strong>ID:</strong>{" "}
                            {therapeuticRegimen?.external_reference?.id ?? EM_DASH}
                        </div>
                        <div>
                            <strong>Reference:</strong>{" "}
                            {therapeuticRegimen?.external_reference?.reference ?? EM_DASH}
                        </div>
                        <div>
                            <strong>Description:</strong>{" "}
                            {therapeuticRegimen?.external_reference?.description ?? EM_DASH}
                        </div>
                    </div>
                }
            </Descriptions.Item>
            <Descriptions.Item label="Start Time">
                {therapeuticRegimen?.start_time &&
                    <TimeElement timeElement={therapeuticRegimen.start_time}/>
                }
            </Descriptions.Item>
            <Descriptions.Item label="End Time">
                {therapeuticRegimen?.start_time &&
                    <TimeElement timeElement={therapeuticRegimen.end_time}/>
                }
            </Descriptions.Item>
            <Descriptions.Item label="Status">
                {therapeuticRegimen?.status ? therapeuticRegimen.status : EM_DASH}
            </Descriptions.Item>
        </Descriptions>
    );
};
TherapeuticRegimen.propTypes = {
    therapeuticRegimen: PropTypes.object,
};

const MedicalActionDetails = ({medicalAction}) => {
    const actionType = getMedicalActionType(medicalAction);

    // The action is the only field always present, other fields are optional.
    return (
        <Descriptions bordered={true} column={1} size="small">
            <Descriptions.Item label={actionType.name}>
                {medicalAction?.procedure &&
                    <Procedure procedure={medicalAction.procedure}/>
                }
                {medicalAction?.treatment &&
                    <Treatment treatment={medicalAction?.treatment}/>
                }
                {medicalAction?.radiation_therapy &&
                    <RadiationTherapy radiationTherapy={medicalAction.radiation_therapy}/>
                }
                {medicalAction?.therapeutic_regimen &&
                    <TherapeuticRegimen therapeuticRegimen={medicalAction.therapeutic_regimen}/>
                }
            </Descriptions.Item>
            <Descriptions.Item label="Adverse Events">
                { Array.isArray(medicalAction?.adverse_events) ?
                    medicalAction.adverse_events.map((advEvent, index) =>
                        <OntologyTerm term={advEvent} key={index}/>)
                    : EM_DASH
                }
            </Descriptions.Item>
        </Descriptions>
    );
};
MedicalActionDetails.propTypes = {
    medicalAction: medicalActionPropTypesShape,
};

const adverseEventsCount = (medicalAction) => {
    return (medicalAction?.adverse_events ?? []).length;
};

const MEDICAL_ACTIONS_COLUMS = [
    {
        title: "Action Type",
        key: "action",
        render: (_, medicalAction) => {
            return getMedicalActionType(medicalAction).name;
        },
        sorter: (a, b) => {
            const aType = getMedicalActionType(a).type;
            const bType = getMedicalActionType(b).type;
            return aType.localeCompare(bType);
        },
    },
    {
        title: "Treatment Target",
        key: "target",
        render: conditionalOntologyRender("treatment_target"),
        sorter: ontologyTermSorter("treatment_target"),
    },
    {
        title: "Treatment Intent",
        key: "intent",
        render: conditionalOntologyRender("treatment_intent"),
        sorter: ontologyTermSorter("treatment_intent"),
    },
    {
        title: "Response To Treatment",
        key: "response",
        render: conditionalOntologyRender("response_to_treatment"),
        sorter: ontologyTermSorter("response_to_treatment"),
    },
    {
        // Only render count, expand for details
        title: "Adverse Events",
        key: "adverse_events",
        render: (_, medicalAction) => adverseEventsCount(medicalAction),
        sorter: (a, b) => {
            const aCount = adverseEventsCount(a);
            const bCount = adverseEventsCount(b);
            return aCount - bCount;
        },
    },
    {
        title: "Treatment Termination Reason",
        key: "termination_reason",
        render: conditionalOntologyRender("treatment_termination_reason"),
        sorter: ontologyTermSorter("treatment_termination_reason"),
    },
];

const MedicalActions = ({medicalActions, handleMedicalActionClick}) => {
    return (
        <RoutedIndividualContentTable
            data={medicalActions}
            urlParam="selectedMedicalAction"
            columns={MEDICAL_ACTIONS_COLUMS}
            rowKey="idx"
            handleRowSelect={handleMedicalActionClick}
            expandedRowRender={(medicalAction) => (
                <MedicalActionDetails
                    medicalAction={medicalAction}
                />
            )}
        />
    );
};
MedicalActions.propTypes = {
    medicalActions: PropTypes.array,
    handleMedicalActionClick: PropTypes.func,
};


const IndividualMedicalActions = ({individual}) => {
    const medicalActions = useIndividualPhenopacketDataIndex(individual, "medical_actions");

    return (
        <RoutedIndividualContent
            data={medicalActions}
            urlParam="selectedMedicalAction"
            renderContent={({data, onContentSelect}) => (
                <MedicalActions
                    medicalActions={data}
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
