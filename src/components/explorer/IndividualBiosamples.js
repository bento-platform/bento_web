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

    handleClick = (b) => {
        const hashLink = this.props.experimentsUrl + "#" + b.id;
        this.props.history.push(hashLink);
    }

    render() {
        const biosamplesData = (this.props.individual?.phenopackets ?? []).flatMap((p) => p.biosamples);

        return (
      <div className="biosamples-descriptions" style={{ display: "inline-block" }}>
        {biosamplesData.map((b, i) => (
            <>
          <Descriptions
            title={`Biosample ${b.id}`}
            layout="horizontal"
            bordered={true}
            column={1}
            size="small"
            key={b.id}
          >
            <Descriptions.Item label="ID">{b.id}</Descriptions.Item>
            <Descriptions.Item label="Sampled Tissue">
              {renderOntologyTerm(b.sampled_tissue)}
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
              <div>
                <strong>Code:</strong> {renderOntologyTerm(b.procedure.code)}
                {b.procedure.body_site ? (
                  <div>
                    <strong>Body Site:</strong> {renderOntologyTerm(b.procedure.body_site)}
                  </div>
                ) : null}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Histological Diagnosis">
              {renderOntologyTerm(b.histological_diagnosis)}
            </Descriptions.Item>
            <Descriptions.Item label="Ind. Age At Collection">
              {b.individual_age_at_collection
                  ? b.individual_age_at_collection.hasOwnProperty("age")
                      ? b.individual_age_at_collection.age
                      : `Between ${b.individual_age_at_collection.start.age}` +
                    `and ${b.individual_age_at_collection.end.age}`
                  : EM_DASH}
            </Descriptions.Item>
            <Descriptions.Item label="Extra Properties">
              {b.hasOwnProperty("extra_properties") && Object.keys(b.extra_properties).length ? (
                <JsonView inputJson={b.extra_properties} />
              ) : (
                  EM_DASH
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Available Experiments">
              {(b.experiments ?? []).flatMap((b) => b?.experiment_type ?? []).map((t, i) => (
                <Button key={i} onClick={() => this.handleClick(b)}>
                  {t}
                </Button>
              ))}
            </Descriptions.Item>
          </Descriptions>
          {i !== (biosamplesData.length - 1) && <Divider/>}
            </>
        ))}
      </div>
        );
    }
}

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    experimentsUrl: PropTypes.string
};

export default withRouter(IndividualBiosamples);
