import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { individualPropTypesShape, measurementPropTypesShape } from "../../propTypes";
import { useIndividualPhenopacketDataIndex } from "./utils";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import { EM_DASH } from "../../constants";
import { Descriptions, Table } from "antd";
import OntologyTerm from "./OntologyTerm";


const FLEX_COLUMN_STYLE = {
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
                    <div style={FLEX_COLUMN_STYLE}>
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

const TYPED_QUANTITY_COLUMNS = [
    {
        title: "Type",
        key: "type",
        render: (_, typedQuantity) => (
            <OntologyTerm resourcesTuple={typedQuantity.resourcesTuple} term={typedQuantity.type}/>
        ),
    },
    {
        title: "Quantity",
        key: "quantity",
        render: (_, typedQuantity) => (
            <Quantity quantity={typedQuantity.quantity} resourcesTuple={typedQuantity.resourcesTuple}/>
        ),
    },
];

const ComplexValue = ({complexValue, resourcesTuple}) => {
    const dataWithResources = useMemo(
        () => complexValue.typed_quantities.map((tq, idx) => {
            tq["resourcesTuple"] = resourcesTuple;
            tq["idx"] = idx;
            return tq;
        }),
        [complexValue, resourcesTuple],
    );
    return (
        <Table
            bordered={true}
            pagination={false}
            size="small"
            columns={TYPED_QUANTITY_COLUMNS}
            dataSource={dataWithResources}
            rowKey={"idx"}
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
            {value?.ontology_class && <OntologyTerm resourcesTuple={resourcesTuple} term={value.ontology_class}/>}
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
            } else if (measurement.hasOwnProperty("complex_value")) {
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
