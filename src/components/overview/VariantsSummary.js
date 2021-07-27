import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Col, Row, Spin, Statistic, Typography, Icon} from "antd";

const mapStateToProps = state => ({
    tableSummaries: state.tableSummaries,
});

const actionCreators = {};

class VariantsSummary extends Component {

    static propTypes = {
        tableSummaries : PropTypes.shape({
            isFetching: PropTypes.bool,
            summariesByServiceArtifactAndTableID: PropTypes.object,
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            sexChartActiveIndex: 0,
            diseaseChartActiveIndex: 0,
            biosamplesChartActiveIndex: 0,
            phenotypicFeaturesThresholdSliderValue: 0.01,
            chartPadding:  "1rem",
            chartWidthHeight: 500,
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3,
        };
    }

    render() {
        const fetchingTableSummaries = this.props.tableSummaries?.isFetching;
        const variantTableSummaries =
            this.props.tableSummaries?.summariesByServiceArtifactAndTableID?.variant;

        let numVariants = 0;
        let numSamples = 0;
        let numVCFs = 0;
        Object.values(variantTableSummaries || []).forEach(s => {
            numVariants += s.count;
            numSamples += s.data_type_specific.samples;
            numVCFs += s.data_type_specific.vcf_files;
        });

        return <>
            <Typography.Title level={4}>Variants</Typography.Title>
            <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                    <Spin spinning={fetchingTableSummaries}>
                        <Statistic title="VCF Files"
                                   prefix={<Icon type="file" />}
                                   value={numVCFs} />
                    </Spin>
                </Col>
            </Row>
        </>;
    }

    updateDimensions = () => {
        if(window.innerWidth < 576) { //xs
            this.setState({
                chartPadding: "0rem",
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 3
            });
        } else if(window.innerWidth < 768) { // sm
            this.setState({
                chartPadding: "1rem",
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 992) { // md
            this.setState({
                chartPadding: "2rem",
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 5 });
        } else if(window.innerWidth < 1200) { // lg
            this.setState({
                chartPadding: "4rem",
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 1600) { // xl
            this.setState({
                chartPadding: "6rem",
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 7 });
        } else {
            this.setState({
                chartPadding: "10rem",
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 5,
                chartLabelPaddingLeft: 7 }); // > xl
        }
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }
}

export default connect(mapStateToProps, actionCreators)(VariantsSummary);
