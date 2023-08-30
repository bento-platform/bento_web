import React, { Component } from "react";
import { Button, Descriptions, Divider } from "antd";
import { EM_DASH } from "../../constants";
import { renderOntologyTerm } from "./ontologies";
import { individualPropTypesShape } from "../../propTypes";
import JsonView from "./JsonView";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

class IndividualBiosamples extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleClick = (eid) => {
        const hashLink = this.props.experimentsUrl + "#" + eid;
        this.props.history.push(hashLink);
    };

    render() {
        const biosamplesData = (
            this.props.individual?.phenopackets ?? []
        ).flatMap((p) => p.biosamples);
        return (
            <div
                className="biosamples-descriptions"
                style={{ display: "inline-block" }}
            >
                {biosamplesData.map((biosample, i) => (
                    <>
                        <Descriptions
                            title={<span id={`biosample-${biosample.id}`}>Biosample {biosample.id}</span>}
                            layout="horizontal"
                            bordered={true}
                            column={1}
                            size="small"
                            key={biosample.id}
                        >
                            <Descriptions.Item label="ID">
                                {biosample.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sampled Tissue">
                                {renderOntologyTerm(biosample.sampled_tissue)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Procedure">
                                <div>
                                    <strong>Code:</strong>{" "}
                                    {renderOntologyTerm(biosample.procedure.code)}
                                    {biosample.procedure.body_site ? (
                                        <div>
                                            <strong>Body Site:</strong>{" "}
                                            {renderOntologyTerm(
                                                biosample.procedure.body_site,
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Histological Diagnosis">
                                {renderOntologyTerm(biosample.histological_diagnosis)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ind. Age At Collection">
                                {biosample.individual_age_at_collection
                                    ? biosample.individual_age_at_collection.age ??
                                        `Between ${biosample.individual_age_at_collection.start.age}` +
                                            `and ${biosample.individual_age_at_collection.end.age}`
                                    : EM_DASH}
                            </Descriptions.Item>
                            <Descriptions.Item label="Extra Properties">
                                {biosample.hasOwnProperty("extra_properties") &&
                                Object.keys(biosample.extra_properties).length ? (
                                    <JsonView inputJson={biosample.extra_properties} />
                                    ) : (
                                        EM_DASH
                                    )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Available Experiments">
                                {(biosample.experiments ?? [])
                                    .map((e, i) => (
                                        <Button
                                            key={i}
                                            onClick={() => this.handleClick(e.id)}
                                        >
                                            {e.experiment_type}
                                        </Button>
                                    ))}
                            </Descriptions.Item>
                        </Descriptions>
                        {i !== biosamplesData.length - 1 && <Divider />}
                    </>
                ))}
            </div>
        );
    }
}

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    experimentsUrl: PropTypes.string,
};

export default withRouter(IndividualBiosamples);
