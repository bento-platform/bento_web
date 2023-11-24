import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { individualPropTypesShape, measurementPropTypesShape } from "../../propTypes";
import { ontologyTermSorter, useIndividualPhenopacketDataIndex } from "./utils";
import { RoutedIndividualContent, RoutedIndividualContentTable } from "./RoutedIndividualContent";
import { EM_DASH } from "../../constants";
import { Descriptions, Table } from "antd";
import OntologyTerm, { conditionalOntologyRender } from "./OntologyTerm";
import { Procedure } from "./IndividualMedicalActions";
import TimeElement from "./TimeElement";


const FLEX_COLUMN_STYLE = {
    "display": "flex",
    "flexDirection": "column",
    "gap": "1em",
};

export const Quantity = ({quantity, title}) => {
    return (
        <Descriptions bordered={true} column={1} size="small" title={title}>
            <Descriptions.Item label="Unit">
                <OntologyTerm term={quantity.unit}/>
            </Descriptions.Item>
            <Descriptions.Item label="Value">{quantity.value}</Descriptions.Item>
            {quantity?.reference_range && (
                <Descriptions.Item label="Reference Range">
                    <div style={FLEX_COLUMN_STYLE}>
                        <div>
                            <strong>Unit:</strong>{" "}<OntologyTerm term={quantity.reference_range.unit}/>
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
    title: PropTypes.string,
};

const COMPLEX_VALUE_COLUMNS = [
    {
        title: "Type",
        key: "type",
        render: conditionalOntologyRender("type"),
        sorter: ontologyTermSorter("type"),

    },
    {
        title: "Quantity",
        key: "quantity",
        render: (_, typedQuantity) => (
            <Quantity quantity={typedQuantity.quantity}/>
        ),
    },
];

const ComplexValue = ({complexValue}) => {
    const indexedData = useMemo(
        () => complexValue.typed_quantities.map((tq, idx) => {
            tq["idx"] = idx;
            return tq;
        }),
        [complexValue],
    );

    return (
        <Table
            bordered={true}
            pagination={false}
            size="small"
            columns={COMPLEX_VALUE_COLUMNS}
            dataSource={indexedData}
            rowKey={"idx"}
        />
    );
};
ComplexValue.propTypes = {
    complexValue: PropTypes.object,
};


const Value = ({value}) => {
    return (
        <>
            {value?.quantity && <Quantity quantity={value.quantity}/>}
            {value?.ontology_class && <OntologyTerm term={value.ontology_class}/>}
        </>
    );
};
Value.propTypes = {
    value: PropTypes.object,
};


const MeasurementValue = ({measurement}) => {
    return (
        <>
            {measurement?.value && (
                <Value value={measurement.value}/>
            )}
            {measurement?.complex_value && (
                <ComplexValue
                    complexValue={measurement.complex_value}
                />
            )}
        </>
    );
};
MeasurementValue.propTypes = {
    measurement: measurementPropTypesShape,
};


const MeasurementDetails = ({ measurement }) => {
    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Measurement Value">
                <MeasurementValue measurement={measurement}/>
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
                {measurement?.procedure
                    ? <Procedure procedure={measurement.procedure}/>
                    : EM_DASH
                }
            </Descriptions.Item>
        </Descriptions>
    );
};
MeasurementDetails.propTypes = {
    measurement: measurementPropTypesShape,
};


const MEASUREMENTS_COLUMNS = [
    {
        title: "Assay",
        key: "assay",
        render: conditionalOntologyRender("assay"),
        sorter: ontologyTermSorter("assay"),
        sortDirections: ["descend", "ascend", "descend"],
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
                return <OntologyTerm term={value?.ontology_class}/>;
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
        title: "Procedure Code",
        key: "procedure",
        render: (_, measurement) => {
            return <OntologyTerm term={measurement?.procedure?.code}/>;
        },
    },
];

export const MeasurementsTable = ({measurements}) => {
    const indexedMeasurements = measurements.map((m, idx) => ({...m, idx: `${idx}`}));
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const onExpand = (e, measurement) => {
        setSelectedRowKeys([e ? measurement.idx : undefined]);
    };
    return (
        <Table
            bordered={true}
            pagination={false}
            size="small"
            columns={MEASUREMENTS_COLUMNS}
            onExpand={onExpand}
            expandedRowKeys={selectedRowKeys}
            expandedRowRender={(measurement) => (
                <MeasurementDetails
                    measurement={measurement}
                />
            )}
            dataSource={indexedMeasurements}
            rowKey={"idx"}
        />
    )
}

const RoutedMeasurementsTable = ({measurements, handleMeasurementClick}) => {
    return (
        <RoutedIndividualContentTable
            data={measurements}
            urlParam="selectedMeasurement"
            columns={MEASUREMENTS_COLUMNS}
            rowKey="idx"
            handleRowSelect={handleMeasurementClick}
            expandedRowRender={(measurement) => (
                <MeasurementDetails
                    measurement={measurement}
                />
            )}
        />
    );
};
RoutedMeasurementsTable.propTypes = {
    measurements: PropTypes.arrayOf(measurementPropTypesShape),
    handleMeasurementClick: PropTypes.func,
};

const IndividualMeasurements = ({individual}) => {
    const measurements = useIndividualPhenopacketDataIndex(individual, "measurements");
    return (
        <RoutedIndividualContent
            data={measurements}
            urlParam="selectedMeasurement"
            renderContent={({data, onContentSelect}) => (
                <RoutedMeasurementsTable
                    measurements={data}
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
