import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { individualPropTypesShape, measurementPropTypesShape } from "../../propTypes";
import { useIndividualPhenopacketDataIndex } from "./utils";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import { EM_DASH } from "../../constants";
import { Descriptions, List } from "antd";
import OntologyTerm from "./OntologyTerm";


const REF_RANGE_STYLE = {
    "display": "flex",
    "flex-direction": "column",
};

const Quantity = ({quantity, resourcesTuple, title}) => {
    return (
        <Descriptions bordered={true} column={1} size="small" title={title}>
            <Descriptions.Item label="Unit">
                <OntologyTerm resourcesTuple={resourcesTuple} term={quantity.unit}/>
            </Descriptions.Item>
            <Descriptions.Item label="Value">{quantity.value}</Descriptions.Item>
            {quantity?.reference_range && (
                <Descriptions.Item label="Reference Range">
                    <div style={REF_RANGE_STYLE}>
                        <div>
                            <strong>Unit:</strong>{" "}<OntologyTerm
                                resourcesTuple={resourcesTuple}
                                term={quantity.reference_range.unit}
                            />
                        </div>
                        <div>
                            <strong>Low:</strong>{` ${quantity.reference_range.low}`}
                        </div>
                        <div>
                            <strong>High:</strong>{` ${quantity.reference_range.high}`}
                        </div>
                    </div>
                </Descriptions.Item>
            )}
        </Descriptions>
    );
};
Quantity.propTypes = {
    quantity: PropTypes.object,
    resourcesTuple: PropTypes.array,
    title: PropTypes.string,
};


const ComplexValue = ({complexValue, resourcesTuple}) => {
    return (
        <List
            header="Typed Quantities"
            bordered
            dataSource={complexValue?.typed_quantities ?? []}
            renderItem={(item) => (
                <List.Item>
                    <OntologyTerm resourcesTuple={resourcesTuple} term={item.type}/>
                    <Quantity quantity={item.quantity} resourcesTuple={resourcesTuple} title="Quantity"/>
                </List.Item>
            )}
        />
    );
};
ComplexValue.propTypes = {
    complexValue: PropTypes.object,
    resourcesTuple: PropTypes.array,
};


const Value = ({value, resourcesTuple}) => {
    return (
        <>
            {value?.quantity && <Quantity quantity={value.quantity} resourcesTuple={resourcesTuple}/>}
            {value?.ontology_class && <OntologyTerm term={value.ontology_class}/>}
        </>
    );
};
Value.propTypes = {
    value: PropTypes.object,
    resourcesTuple: PropTypes.array,
};


const MeasurementValue = ({measurement, resourcesTuple}) => {
    return (
        <>
            {measurement?.value && (
                <Value value={measurement.value} resourcesTuple={resourcesTuple}/>
            )}
            {measurement?.complex_value && (
                <ComplexValue
                    complexValue={measurement.complex_value}
                    resourcesTuple={resourcesTuple}
                />
            )}
        </>
    );
};
MeasurementValue.propTypes = {
    measurement: measurementPropTypesShape,
    resourcesTuple: PropTypes.array,
};


const MeasurementDetails = ({ measurement, resourcesTuple }) => {
    console.log(measurement);
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Assay">
                <OntologyTerm resourcesTuple={resourcesTuple} term={measurement.assay}/>
            </Descriptions.Item>
            <Descriptions.Item label="Measurement Value">
                <MeasurementValue measurement={measurement} resourcesTuple={resourcesTuple}/>
            </Descriptions.Item>
        </Descriptions>
    );
};
MeasurementDetails.propTypes = {
    measurement: measurementPropTypesShape,
    resourcesTuple: PropTypes.array,
};

const MEASUREMENTS_COLUMNS = [
    {
        title: "Assay",
        key: "assay",
        render: (_, measurement) => {
            return measurement?.assay?.label ?? EM_DASH;
        },
    },
    {
        title: "Measurement Value",
        key: "value",
        render: (_, measurement) => {
            if (measurement.hasOwnProperty("value")) {
                const value = measurement.value;
                if (value.hasOwnProperty("quantity")) {
                    return `${value.quantity.value} (${value.quantity.unit.label})`;
                }
                return value?.ontology_class?.label ?? EM_DASH;
            } else if (measurement.hasOwnProperty("complexValue")) {
                return "Complex value (expand for details)";
            }
            return EM_DASH;
        },
    },
    {
        title: "Description",
        dataIndex: "description",
    },
    {
        title: "Procedure",
        key: "procedure",
        render: (_, measurement) => {
            return measurement?.procedure?.code?.label ?? "";
        },
    },
];

const Measurements = ({measurements, resourcesTuple, handleMeasurementClick}) => {
    const expandedRowRender = useCallback(
        (measurement) => (
            <MeasurementDetails
                measurement={measurement}
                resourcesTuple={resourcesTuple}
            />
        ), [],
    );
    return (
        <RoutedIndividualContentTable
            data={measurements}
            urlParam="selectedMeasurement"
            columns={MEASUREMENTS_COLUMNS}
            rowKey="idx"
            handleRowSelect={handleMeasurementClick}
            expandedRowRender={expandedRowRender}
        />
    );
};
Measurements.propTypes = {
    measurements: PropTypes.arrayOf(measurementPropTypesShape),
    resourcesTuple: PropTypes.array,
    handleMeasurementClick: PropTypes.func,
};

const IndividualMeasurements = ({individual}) => {
    const measurements = useIndividualPhenopacketDataIndex(individual, "measurements");
    return (
        <RoutedIndividualContent
            individual={individual}
            data={measurements}
            urlParam="selectedMeasurement"
            renderContent={({data, onContentSelect, resourcesTuple}) => (
                <Measurements
                    measurements={data}
                    resourcesTuple={resourcesTuple}
                    handleMeasurementClick={onContentSelect}
                />
            )}
        />
    );
};
IndividualMeasurements.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualMeasurements;
