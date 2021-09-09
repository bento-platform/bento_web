import React, { Component } from "react";
import { connect } from "react-redux";

import { Table } from "antd";
import { Descriptions } from "antd";
import { withRouter } from "react-router-dom";
import { EM_DASH } from "../../constants";
import { renderOntologyTerm } from "./ontologies";
import { individualPropTypesShape } from "../../propTypes";
import { performDownloadFromDrsIfPossible } from "../../modules/drs/actions";
import PropTypes from "prop-types";
import JsonView from "./JsonView";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

class IndividualBiosamples extends Component {

  BIOSAMPLE_COLUMNS = [
      {
          title: "ID",
          key: "id",
          render: (_, individual) => individual.id,
          sorter: (a, b) => a.id.localeCompare(b.id),
          defaultSortOrder: "ascend",
      },
      {
          title: "Sampled Tissue",
          key: "sampled_tissue",
          render: (_, individual) => renderOntologyTerm(individual.sampled_tissue),
      },
      {
          title: "Procedure",
          key: "procedure",
          render: (_, individual) => (
              <>
          <strong>Code:</strong> {renderOntologyTerm(individual.procedure.code)}
          <br />
          {individual.procedure.body_site ? (
              <>
              <br />
              <strong>Body Site:</strong> {renderOntologyTerm(individual.procedure.body_site)}
              </>
          ) : null}
              </>
          ),
      },
      {
          title: "Ind. Age at Collection",
          key: "individual_age_at_collection",
          render: (_, individual) => {
              const age = individual.individual_age_at_collection;
              return age
                  ? age.hasOwnProperty("age")
                      ? age.age
                      : `Between ${age.start.age} and ${age.end.age}`
                  : EM_DASH;
          },
      },
      {
          title: "Extra Properties",
          key: "extra_properties",
          render: (_, individual) =>
              (individual ?? {}).hasOwnProperty("extra_properties") &&
        Object.keys(individual.extra_properties).length ? (
          <div>
            <JsonView inputJson={individual.extra_properties} />
          </div>
                  ) : (
                      EM_DASH
                  ),
      },
      {
          title: "Download",
          key: "extra_properties",
          render: (_, individual) =>
              (individual ?? {}).hasOwnProperty("experiments") && Object.keys(individual.experiments).length
                  ? individual.experiments.flatMap((exp) =>
                      (exp ?? {}).hasOwnProperty("experiment_results") && Object.keys(exp.experiment_results).length
                          ? exp.experiment_results
                              .flatMap((result) =>
                                  (result ?? {}).hasOwnProperty("filename") && Object.keys(result.filename).length
                                      ? result.filename
                                      : EM_DASH
                              )
                              .filter(isKindOfVcf)
                              .flatMap((name) => (
                      <div>
                        <a onClick={async () => this.props.performDownloadFromDrsIfPossible(name)}>{name}</a>
                      </div>
                              ))
                          : EM_DASH
                  )
                  : EM_DASH,
      },
  ];

  constructor(props) {
      super(props);

      this.state = {};

    // Ensure user is at the top of the page after transition
      window.scrollTo(0, 0);
  }

  render() {
      const biosamplesData = (this.props.individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
      const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);

      const experimentLayouts = (experimentsData ?? []).flatMap((e) => {
          return (
        <Descriptions layout="vertical" bordered={true} size="middle">
          <Descriptions.Item label="Experiment Type">{e?.experiment_type || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Study Type">{e?.study_type || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Library Layout">{e?.library_layout || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Library Selection">{e?.library_selection || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Library Source">{e?.library_source || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Library Strategy">{e?.library_strategy || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Molecule">{e?.molecule || EM_DASH}</Descriptions.Item>
          <Descriptions.Item label="Molecule Ontology">
            {(e ?? {}).hasOwnProperty("molecule_ontology") && e.molecule_ontology.length ? (
              <div>
                  {e.molecule_ontology.map((m, i) => (
                    <JsonView inputJson={m} key={i} />
                  ))}
              </div>
            ) : (
                EM_DASH
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Extration Protocol">
            {e?.extraction_protocol || EM_DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Instrument">
            {(e ?? {}).hasOwnProperty("instrument") && Object.keys(e.instrument).length ? (
                  <JsonView inputJson={e.instrument} />
            ) : (
                EM_DASH
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Experiment Ontology">
            {(e ?? {}).hasOwnProperty("experiment_ontology") && e.experiment_ontology.length ? (
              <div>
                  {e.experiment_ontology.map((m, i) => (
                    <JsonView inputJson={m} key={i}/>
                  ))}
              </div>
            ) : (
                EM_DASH
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Extra Properties">
            {(e ?? {}).hasOwnProperty("extra_properties") && Object.keys(e.extra_properties).length ? (
                <JsonView inputJson={e.extra_properties} />
            ) : (
                EM_DASH
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Experiment Results">
            {(e ?? {}).hasOwnProperty("experiment_results") && e.experiment_results.length ? (
              <div>
                  {e.experiment_results.map((m, i) => (
                    <JsonView inputJson={m} key={i}/>
                  ))}
              </div>
            ) : (
                EM_DASH
            )}
          </Descriptions.Item>
        </Descriptions>
          );
      });

      return (
          <>
        <Table
          bordered
          size="middle"
          pagination={{ pageSize: 25 }}
          columns={this.BIOSAMPLE_COLUMNS}
          rowKey="id"
          dataSource={biosamplesData}
        />

        {experimentLayouts}
          </>
      );
  }
}

function isKindOfVcf(filename) {
    return filename.toLowerCase().includes(".vcf");
}

IndividualBiosamples.propTypes = {
    individual: individualPropTypesShape,
    performDownloadFromDrsIfPossible: PropTypes.func.isRequired,
};

export default withRouter(connect(null, {
    performDownloadFromDrsIfPossible
})(IndividualBiosamples));
