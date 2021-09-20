import React, { Component } from "react";
import { Descriptions, Icon, Popover, Table, Typography } from "antd";
import { BENTO_BLUE, EM_DASH } from "../../constants";
import { individualPropTypesShape } from "../../propTypes";
import { performDownloadFromDrsIfPossible } from "../../modules/drs/actions";
import JsonView from "./JsonView";
import { withRouter } from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";

class IndividualExperiments extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const biosamplesData = (this.props.individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
        const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);

        const titleStyle = { fontSize: "16px", fontWeight: "bold", color: BENTO_BLUE };

        const EXPERIMENT_RESULTS_COLUMNS = [
            {
                title: "Result File",
                key: "result_file",
                render: (_, result) => result.file_format,
            },
            {
                title: "Creation Date",
                key: "creation_date",
                render: (_, result) => result.creation_date,
            },
            {
                title: "Description",
                key: "description",
                render: (_, result) => result.description,
            },
            {
                title: "Filename",
                key: "filename",
                render: (_, result) => result.filename,
            },
            {
                title: "Download",
                key: "download",
                align: "center",
                render: (_, result) =>
                    isDownloadable(result) ? (
            <div>
              <a onClick={async () => this.props.performDownloadFromDrsIfPossible(result.filename)}>
                <Icon type={"cloud-download"} />
              </a>
            </div>
                    ) : (
                        EM_DASH
                    ),
            },
            {
                title: "Other Details",
                key: "other_details",
                render: (_, result) => (
              <Popover
                placement="leftTop"
                title={`Experiment Results: ${result.file_format}`}
                content={
                  <div className="other-details">
                <Descriptions
                  layout="horizontal"
                  bordered={true}
                  colon={false}
                  column={1}
                  size="small"
                >
                  <Descriptions.Item label="id">{result.id}</Descriptions.Item>
                  <Descriptions.Item label="identifier">{result.identifier}</Descriptions.Item>
                  <Descriptions.Item label="description">{result.description}</Descriptions.Item>
                  <Descriptions.Item label="filename">{result.filename}</Descriptions.Item>
                  <Descriptions.Item label="file format">{result.file_format}</Descriptions.Item>
                  <Descriptions.Item label="data output type">{result.data_output_type}</Descriptions.Item>
                  <Descriptions.Item label="usage">{result.usage}</Descriptions.Item>
                  <Descriptions.Item label="creation date">{result.creation_date}</Descriptions.Item>
                  <Descriptions.Item label="created by">{result.created_by}</Descriptions.Item>
                  <Descriptions.Item label="created">{result.created}</Descriptions.Item>
                  <Descriptions.Item label="updated">{result.updated}</Descriptions.Item>
                  </Descriptions>
                  </div>
                  }
                trigger="click"
              >
               <p className="other-details-click"> click here </p>
              </Popover>
                ),
            },
        ];

        return (
            <>
        {experimentsData.map((e) => (
          <div className="experiment_and_results" key={e.id}>
            <div className="experiment-titles">
            <Typography.Text
              style={titleStyle}
            >
              {`${e.experiment_type} (Biosample ${e.biosample})`}{" "}
            </Typography.Text>
            </div>
            <div className="experiment_summary">
                <Descriptions
                  layout="vertical"
                  bordered={true}
                  colon={false}
                  column={1}
                  size="small"
                  key={e.id}
                >
                  <Descriptions.Item>
                    {(e.molecule_ontology ?? []).map((mo) => (
                      <Descriptions
                        title="Molecule Ontology"
                        layout="horizontal"
                        bordered={true}
                        column={1}
                        size="small"
                        key={mo.id}
                      >
                        <Descriptions.Item label="id">{mo.id}</Descriptions.Item>
                        <Descriptions.Item label="label">{mo.label}</Descriptions.Item>
                      </Descriptions>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item>
                    {(e.experiment_ontology ?? []).map((eo) => (
                      <Descriptions
                        title="Experiment Ontology"
                        layout="horizontal"
                        bordered={true}
                        column={1}
                        size="small"
                        key={eo.id}
                      >
                        <Descriptions.Item label="id">{eo.id}</Descriptions.Item>
                        <Descriptions.Item label="label">{eo.label}</Descriptions.Item>
                      </Descriptions>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item>
                    <Descriptions
                      title="Instrument"
                      layout="horizontal"
                      bordered={true}
                      column={1}
                      size="small"
                    >
                      <Descriptions.Item label="id">{e.instrument.id}</Descriptions.Item>
                      <Descriptions.Item label="identifier">{e.instrument.identifier}</Descriptions.Item>
                      <Descriptions.Item label="platform">{e.instrument.platform}</Descriptions.Item>
                      <Descriptions.Item label="created">{e.instrument.created}</Descriptions.Item>
                      <Descriptions.Item label="updated">{e.instrument.updated}</Descriptions.Item>
                    </Descriptions>
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions layout="vertical" bordered={true} column={1} size="small" >
                  <Descriptions.Item>
                    <Descriptions layout="horizontal" bordered={true} column={1} size="small">
                      <Descriptions.Item label="Experiment Type">{e.experiment_type}</Descriptions.Item>
                      <Descriptions.Item label="Study Type">{e.study_type}</Descriptions.Item>
                      <Descriptions.Item label="Extraction Protocol">
                        {e.extraction_protocol}
                      </Descriptions.Item>
                      <Descriptions.Item label="Library Layout">{e.library_layout}</Descriptions.Item>
                      <Descriptions.Item label="Library Selection">{e.library_selection}</Descriptions.Item>
                      <Descriptions.Item label="Library Source">{e.library_source}</Descriptions.Item>
                      <Descriptions.Item label="Library Strategy">{e.library_strategy}</Descriptions.Item>
                    </Descriptions>
                  </Descriptions.Item>
                  <Descriptions.Item>
                    <Descriptions
                      title="Extra Properties"
                      layout="horizontal"
                      bordered={true}
                      column={1}
                      size="small"
                    >
                      <Descriptions.Item>
                        <JsonView inputJson={e.extra_properties} />
                      </Descriptions.Item>
                    </Descriptions>
                  </Descriptions.Item>
                </Descriptions>
            </div>
            <div className="experiment-titles">
            <Typography.Text style={titleStyle} level={4}> { `${e.experiment_type} - Results` }</Typography.Text>
            </div>
            <Table
              bordered
              size="small"
              pagination={false}
              columns={EXPERIMENT_RESULTS_COLUMNS}
              rowKey="filename"
              dataSource={e.experiment_results}
            />
          </div>
        ))}
            </>
        );
    }
}

// expand here accordingly
function isDownloadable(result) {
    return result.file_format.toLowerCase() === "vcf" || result.filename.toLowerCase().includes(".vcf");
}

IndividualExperiments.propTypes = {
    individual: individualPropTypesShape,
    performDownloadFromDrsIfPossible: PropTypes.func.isRequired,
};

export default withRouter(connect(null, {
    performDownloadFromDrsIfPossible
})(IndividualExperiments));

