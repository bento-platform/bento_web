import React from "react";
import PropTypes from "prop-types";

import { uniqueId } from "lodash";

import { Descriptions, Table } from "antd";

import { EM_DASH } from "@/constants";
import { individualPropTypesShape, medicalActionPropTypesShape } from "@/propTypes";

import { STYLE_FIX_NESTED_TABLE_MARGIN } from "./styles";
import { ontologyTermSorter, useIndividualPhenopacketDataIndex } from "./utils";
import OntologyTerm, { conditionalOntologyRender } from "./OntologyTerm";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import TimeElement, { TimeInterval } from "./TimeElement";
import { Quantity } from "./IndividualMeasurements";

const ACTION_TYPES = {
  procedure: "Procedure",
  treatment: "Treatment",
  radiation_therapy: "Radiation Therapy",
  therapeutic_regimen: "Therapeutic Regimen",
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

export const Procedure = ({ procedure }) => (
  <Descriptions bordered column={1} size="small">
    <Descriptions.Item label="Code">
      <OntologyTerm term={procedure.code} />
    </Descriptions.Item>
    <Descriptions.Item label="Body Site">
      <OntologyTerm term={procedure.body_site} />
    </Descriptions.Item>
    <Descriptions.Item label="Performed">
      <TimeElement timeElement={procedure.performed} />
    </Descriptions.Item>
  </Descriptions>
);
Procedure.propTypes = {
  procedure: PropTypes.object,
};

const DOSE_INTERVAL_COLUMNS = [
  {
    title: "Quantity",
    render: (_, doseInterval) => <Quantity quantity={doseInterval.quantity} />,
    key: "quantity",
  },
  {
    title: "Schedule Frequency",
    render: (_, doseInterval) => <OntologyTerm term={doseInterval.schedule_frequency} />,
    key: "schedule_frequency",
  },
  {
    title: "Interval",
    render: (_, doseInterval) => <TimeInterval timeInterval={doseInterval.interval} br={true} />,
    key: "interval",
  },
];

export const Treatment = ({ treatment }) => (
  <Descriptions bordered column={1} size="small">
    <Descriptions.Item label="Agent">
      <OntologyTerm term={treatment.agent} />
    </Descriptions.Item>
    <Descriptions.Item label="Route of Administration">
      <OntologyTerm term={treatment.route_of_administration} />
    </Descriptions.Item>
    <Descriptions.Item label="Dose Intervals">
      {treatment?.dose_intervals ? (
        <div>
          <Table
            bordered={true}
            pagination={false}
            size="small"
            columns={DOSE_INTERVAL_COLUMNS}
            dataSource={treatment.dose_intervals}
            rowKey={() => uniqueId()}
            style={STYLE_FIX_NESTED_TABLE_MARGIN}
          />
        </div>
      ) : (
        EM_DASH
      )}
    </Descriptions.Item>
    <Descriptions.Item label="Drug Type">{treatment.drug_type}</Descriptions.Item>
    <Descriptions.Item label="Cumulative Dose">
      {treatment?.cumulative_dose ? <Quantity quantity={treatment.cumulative_dose} /> : EM_DASH}
    </Descriptions.Item>
  </Descriptions>
);
Treatment.propTypes = {
  treatment: PropTypes.object,
};

export const RadiationTherapy = ({ radiationTherapy }) => (
  <Descriptions bordered column={1} size="small">
    <Descriptions.Item label="Modality">
      <OntologyTerm term={radiationTherapy.modality} />
    </Descriptions.Item>
    <Descriptions.Item label="Body Site">
      <OntologyTerm term={radiationTherapy.body_site} />
    </Descriptions.Item>
    <Descriptions.Item label="Dosage">{radiationTherapy.dosage}</Descriptions.Item>
    <Descriptions.Item label="Fractions">{radiationTherapy.fractions}</Descriptions.Item>
  </Descriptions>
);
RadiationTherapy.propTypes = {
  radiationTherapy: PropTypes.object,
};

export const TherapeuticRegimen = ({ therapeuticRegimen }) => {
  return (
    <Descriptions bordered column={1} size="small">
      <Descriptions.Item label="Identifier">
        {therapeuticRegimen?.ontology_class && <OntologyTerm term={therapeuticRegimen.ontology_class} />}
        {therapeuticRegimen?.external_reference && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <strong>ID:</strong> {therapeuticRegimen?.external_reference?.id ?? EM_DASH}
            </div>
            <div>
              <strong>Reference:</strong> {therapeuticRegimen?.external_reference?.reference ?? EM_DASH}
            </div>
            <div>
              <strong>Description:</strong> {therapeuticRegimen?.external_reference?.description ?? EM_DASH}
            </div>
          </div>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Start Time">
        {therapeuticRegimen?.start_time && <TimeElement timeElement={therapeuticRegimen.start_time} />}
      </Descriptions.Item>
      <Descriptions.Item label="End Time">
        {therapeuticRegimen?.start_time && <TimeElement timeElement={therapeuticRegimen.end_time} />}
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

const MedicalActionDetails = ({ medicalAction }) => {
  const actionType = getMedicalActionType(medicalAction);

  // The action is the only field always present, other fields are optional.
  return (
    <Descriptions bordered={true} column={1} size="small">
      <Descriptions.Item label={actionType.name}>
        {medicalAction?.procedure && <Procedure procedure={medicalAction.procedure} />}
        {medicalAction?.treatment && <Treatment treatment={medicalAction?.treatment} />}
        {medicalAction?.radiation_therapy && <RadiationTherapy radiationTherapy={medicalAction.radiation_therapy} />}
        {medicalAction?.therapeutic_regimen && (
          <TherapeuticRegimen therapeuticRegimen={medicalAction.therapeutic_regimen} />
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Adverse Events">
        {Array.isArray(medicalAction?.adverse_events)
          ? medicalAction.adverse_events.map((advEvent, index) => (
              <OntologyTerm term={advEvent} key={index} br={true} />
            ))
          : EM_DASH}
      </Descriptions.Item>
    </Descriptions>
  );
};
MedicalActionDetails.propTypes = {
  medicalAction: medicalActionPropTypesShape,
};

const adverseEventsCount = (medicalAction) => (medicalAction?.adverse_events ?? []).length;

const MEDICAL_ACTIONS_COLUMNS = [
  {
    title: "Action Type",
    key: "action",
    render: (_, medicalAction) => getMedicalActionType(medicalAction).name,
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
    sorter: (a, b) => adverseEventsCount(a) - adverseEventsCount(b),
  },
  {
    title: "Treatment Termination Reason",
    key: "termination_reason",
    render: conditionalOntologyRender("treatment_termination_reason"),
    sorter: ontologyTermSorter("treatment_termination_reason"),
  },
];

const expandedMedicalActionRowRender = (medicalAction) => <MedicalActionDetails medicalAction={medicalAction} />;
const MedicalActions = ({ medicalActions, handleMedicalActionClick }) => (
  <RoutedIndividualContentTable
    data={medicalActions}
    urlParam="selectedMedicalAction"
    columns={MEDICAL_ACTIONS_COLUMNS}
    rowKey="idx"
    handleRowSelect={handleMedicalActionClick}
    expandedRowRender={expandedMedicalActionRowRender}
  />
);
MedicalActions.propTypes = {
  medicalActions: PropTypes.array,
  handleMedicalActionClick: PropTypes.func,
};

const IndividualMedicalActions = ({ individual }) => {
  const medicalActions = useIndividualPhenopacketDataIndex(individual, "medical_actions");
  return (
    <RoutedIndividualContent
      urlParam="selectedMedicalAction"
      renderContent={({ onContentSelect }) => (
        <MedicalActions medicalActions={medicalActions} handleMedicalActionClick={onContentSelect} />
      )}
    />
  );
};

IndividualMedicalActions.propTypes = {
  individual: individualPropTypesShape,
};

export default IndividualMedicalActions;
