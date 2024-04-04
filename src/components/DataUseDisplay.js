import React, { memo } from "react";

import { Col, List, Row, Tag, Typography, Popover } from "antd";

import {
    DUO_NOT_FOR_PROFIT_USE_ONLY,
    DATA_USE_KEYS,
    DATA_USE_INFO,
    DATA_USE_PROP_TYPE_SHAPE,
    PRIMARY_CONSENT_CODE_INFO,
    SECONDARY_CONSENT_CODE_INFO,
} from "../duo";
import { StopOutlined } from "@ant-design/icons";


const TAG_LABEL_STYLING = {
    fontSize: "0.65rem",
    color: "#777",
    marginTop: "-4px",
    marginBottom: "4px",
};

const TAG_STYLING = {
    fontFamily: "monospace",
};


const DataUseDisplay = memo(({ dataUse }) => {
    const { consent_code: consentCode, data_use_requirements: dataUseRequirements } = dataUse;

    const primaryCode = consentCode.primary_category.code;
    const uses = dataUseRequirements.map(u => u.code) || [];

    return <>
        <div>
            <Typography.Title level={4} style={{ marginTop: 0, fontSize: "20px" }}>Consent Code</Typography.Title>
            <Row gutter={10} type="flex">
                <Col>
                    <div style={TAG_LABEL_STYLING}>Primary</div>
                    <Popover {...PRIMARY_CONSENT_CODE_INFO[primaryCode]} overlayStyle={{maxWidth: "576px"}}>
                        <Tag color="blue" style={TAG_STYLING}>
                            {consentCode.primary_category.code}
                        </Tag>
                    </Popover>
                </Col>
                <Col>
                    <div style={TAG_LABEL_STYLING}>Secondary</div>
                    {consentCode.secondary_categories.length > 0
                        ? consentCode.secondary_categories.map((sc) => (
                            <Popover {...SECONDARY_CONSENT_CODE_INFO[sc.code]}
                                     key={sc.code}
                                     overlayStyle={{maxWidth: "576px"}}>
                                <Tag style={TAG_STYLING}>{sc.code}</Tag>
                            </Popover>
                        ))
                        : <Tag style={{...TAG_STYLING, background: "white", borderStyle: "dashed"}}>N/A</Tag>}
                </Col>
            </Row>
        </div>
        <div style={{marginTop: "20px"}}>
            <Typography.Title level={4}>Restrictions and Conditions</Typography.Title>
            {/* TODO: Empty display when no restrictions present */}
            <List
                itemLayout="horizontal" style={{maxWidth: "600px"}}
                dataSource={DATA_USE_KEYS.filter(u => uses.includes(u))}
                renderItem={(u) => {
                    const DataUseIcon = DATA_USE_INFO[u].Icon;
                    return (
                        <List.Item>
                            <List.Item.Meta avatar={
                                u === DUO_NOT_FOR_PROFIT_USE_ONLY ? (
                                    // Special case for non-profit use; stack two icons (dollar + stop) to
                                    // create a custom synthetic icon.
                                    <div style={{opacity: 0.65}}>
                                        <DataUseIcon style={{fontSize: "24px", color: "black"}} />
                                        <StopOutlined style={{fontSize: "24px", marginLeft: "-24px", color: "black"}} />
                                    </div>
                                ) : <DataUseIcon style={{fontSize: "24px"}} />
                            } title={DATA_USE_INFO[u].title} description={DATA_USE_INFO[u].content} />
                        </List.Item>
                    );
                }}
            />
        </div>
    </>;
});

DataUseDisplay.propTypes = {
    dataUse: DATA_USE_PROP_TYPE_SHAPE,
};

export default DataUseDisplay;
