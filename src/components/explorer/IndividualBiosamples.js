import React, { Component } from "react";
import { Button, Descriptions } from "antd";
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

    handleClick = () => {
        this.props.history.push(this.props.experimentsUrl);
    }

    render() {
      const biosamplesData = (this.props.individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
      const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
      const experimentType = experimentsData.flatMap((t) => t?.experiment_type ?? []);

      return (
      <div className="biosamples-descriptions" style={{ display: "inline-block" }}>
        {biosamplesData.map((b) => (
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
              {experimentType.map((t, i) => (
                <Button key={i} onClick={this.handleClick}>
                  {t}
                </Button>
              ))}
            </Descriptions.Item>
          </Descriptions>
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
