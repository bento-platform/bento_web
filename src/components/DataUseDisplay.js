import React, {Component} from "react";
import PropTypes from "prop-types";

import {Col, Icon, Popover, Row, Tag, Typography} from "antd";

import "antd/es/col/style/css";
import "antd/es/icon/style/css";
import "antd/es/popover/style/css";
import "antd/es/row/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";


const DATA_USE_KEYS = ["COL", "IRB", "GS", "IS", "NPU", "PS", "MOR", "PUB", "RTN", "TS", "US"];

const DATA_USE_INFO = {
    COL: {
        icon: "team",
        title: "Collaboration Required",
        content: "This requirement indicates that the requester must agree to collaboration with the primary " +
            "study investigator(s)."
    },
    IRB: {
        icon: "reconciliation",
        title: "Ethics Approval Required",
        content: "This requirement indicates that the requester must provide documentation of local IRB/ERB approval."
    },
    GS: {
        icon: "global",
        title: "Geographical Restriction",
        content: "This requirement indicates that use is limited to within a specific geographic region."
    },
    IS: {
        icon: "bank",
        title: "Institution-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved institution."
    },
    NPU: {
        icon: "dollar", // Gets modified below
        title: "Not-For-Profit Use Only",
        content: "This requirement indicates that use of the data is limited to not-for-profit organizations " +
            "and not-for-profit use, non-commercial use."
    },
    PS: {
        icon: "audit",
        title: "Project-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved project."
    },
    MOR: {
        icon: "exception",
        title: "Publication Moratorium",
        content: "This requirement indicates that requester agrees not to publish results of studies until a " +
            "specific date"
    },
    PUB: {
        icon: "file-done",
        title: "Publication Required",
        content: "This requirement indicates that requester agrees to make results of studies using the data " +
            "available to the larger scientific community."
    },
    RTN: {
        icon: "database",
        title: "Return to Database or Resource",
        content: "This requirement indicates that the requester must return derived/enriched data to the " +
            "database/resource."
    },
    TS: {
        icon: "clock-circle",
        title: "Time Limit on Use",
        content: "This requirement indicates that use is approved for a specific number of months."
    },
    US: {
        icon: "user",
        title: "User-Specific Restriction",
        content: "This requirement indicates that use is limited to use by approved users."
    }
};


const TAG_LABEL_STYLING = {
    fontSize: "0.65rem",
    color: "#777",
    marginTop: "-4px",
    marginBottom: "4px"
};


class DataUseDisplay extends Component {
    render() {
        return (
            <div style={{
                display: "flex",
                flexDirection: this.props.size === "large" ? "column" : "row"
            }}>
                <div>
                    <Typography.Title level={4} style={{fontSize: this.props.size === "large" ? "20px" : "14px"}}>
                        Consent Code
                    </Typography.Title>
                    <Row gutter={this.props.size === "large" ? 10 : 8} type="flex">
                        <Col>
                            <div style={TAG_LABEL_STYLING}>Primary</div>
                            <Tag color="blue" style={{fontFamily: "monospace"}}>GRU-CC</Tag>
                        </Col>
                        <Col>
                            <div style={TAG_LABEL_STYLING}>Secondary</div>
                            <Tag style={{fontFamily: "monospace"}}>GSO</Tag>
                            <Tag style={{fontFamily: "monospace"}}>NGMR</Tag>
                            <Tag style={{fontFamily: "monospace"}}>RS</Tag>
                            <Tag style={{fontFamily: "monospace"}}>RU</Tag>
                        </Col>
                    </Row>
                </div>
                <div style={{margin: this.props.size === "large" ? "20px 0 0 0" : "0 0 0 20px"}}>
                <Typography.Title level={4} style={{fontSize: this.props.size === "large" ? "20px" : "14px"}}>
                    Restrictions and Conditions
                </Typography.Title>
                <Row gutter={this.props.size === "large" ? 10 : 8} type="flex">
                    {DATA_USE_KEYS.map(u => {
                        let internalIcon = (
                            <Icon style={{
                                fontSize: this.props.size === "large" ? "24px" : "20px",
                                color: `rgba(0, 0, 0, ${this.props.uses.includes(u) ? 0.65 : 0.1})`
                            }} type={DATA_USE_INFO[u].icon} />
                        );

                        if (u === "NPU") {
                            // Special case for non-profit use; stack two icons (dollar + stop) to
                            // create a custom synthetic icon.
                            internalIcon = (
                                <div style={{opacity: this.props.uses.includes(u) ? 0.65 : 0.1}}>
                                    <Icon style={{
                                        fontSize: this.props.size === "large" ? "24px" : "20px",
                                        color: "black"
                                    }} type={DATA_USE_INFO[u].icon} />
                                    <Icon style={{
                                        fontSize: this.props.size === "large" ? "24px" : "20px",
                                        marginLeft: this.props.size === "large" ? "-24px" : "-20px",
                                        mixBlendMode: "overlay",
                                        color: "black"
                                    }} type="stop" />
                                </div>
                            );
                        }

                        // noinspection HtmlDeprecatedAttribute
                        return (
                            <Col key={u}>
                                {this.props.uses.includes(u) ? (
                                    <Popover title={DATA_USE_INFO[u].title}
                                             content={DATA_USE_INFO[u].content}
                                             trigger="hover"
                                             placement="topRight"
                                             align={{offset: [10, 0]}}>
                                        {internalIcon}
                                    </Popover>
                                ) : internalIcon}
                            </Col>
                        );
                    })}
                </Row>
                </div>
            </div>
        );
    }
}

DataUseDisplay.propTypes = {
    uses: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.string
};

export default DataUseDisplay;
