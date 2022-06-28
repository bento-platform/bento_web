import React, { useState, memo } from "react";
import PropTypes from "prop-types";

import { Checkbox, List, Icon, Radio, Typography } from "antd";

import {
    PRIMARY_CONSENT_CODE_KEYS,
    PRIMARY_CONSENT_CODE_INFO,
    SECONDARY_CONSENT_CODE_KEYS,
    SECONDARY_CONSENT_CODE_INFO,
    DATA_USE_PROP_TYPE_SHAPE,
    DATA_USE_KEYS,
    DATA_USE_INFO,
    DUO_NOT_FOR_PROFIT_USE_ONLY,
} from "../duo";

const sortSCC = (a, b) =>
    SECONDARY_CONSENT_CODE_KEYS.indexOf(a.code) -
    SECONDARY_CONSENT_CODE_KEYS.indexOf(b.code);
const sortDUR = (a, b) =>
    DATA_USE_KEYS.indexOf(a.code) - DATA_USE_KEYS.indexOf(b.code);

const DataUseInput = ({ value, onChange }) => {
    const [consentCode, setConsentCode] = useState({
        primary_category: value?.consent_code?.primary_category ?? null,
        secondary_categories: [
            ...(value?.consent_code?.secondary_categories ?? []),
        ],
    });

    const [dataUseRequirements, setDataUseRequirements] = useState([
        ...(value.data_use_requirements ?? []),
    ]);

    const triggerChange = (change) => {
        const newState = {
            ...{
                consent_code: consentCode,
                data_use_requirements: dataUseRequirements,
            },
            ...change,
        };
        setConsentCode(newState.consent_code);
        setDataUseRequirements(newState.data_use_requirements);

        if (onChange) {
            onChange(newState);
        }
    };

    const handlePCCChange = (code) => {
        triggerChange({
            consent_code: {
                ...consentCode,
                primary_category: { code },
            },
        });
    };

    const handleSCCChange = (event, code) => {
        triggerChange({
            consent_code: {
                ...consentCode,
                secondary_categories: event.target.checked
                    ? [...consentCode.secondary_categories, { code }].sort(
                        sortSCC
                    )
                    : consentCode.secondary_categories.filter(
                        (c) => c.code !== code
                    ),
            },
        });
    };

    const handleDURChange = (event, code) => {
        triggerChange({
            data_use_requirements: event.target.checked
                ? [...dataUseRequirements, { code }].sort(sortDUR)
                : dataUseRequirements.filter((c) => c.code !== code),
        });
    };

    return (
        <>
            <div>
                <Typography.Title level={4} style={{ fontSize: "20px" }}>
                    Consent Code
                </Typography.Title>

                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Primary
                </div>
                <Radio.Group
                    name="primary_consent_code"
                    value={
                        (
                            consentCode.primary_category ?? {
                                code: null,
                            }
                        ).code
                    }
                    onChange={(e) => handlePCCChange(e.target.value)}
                >
                    <List itemLayout="horizontal" style={{ maxWidth: "600px" }}>
                        {PRIMARY_CONSENT_CODE_KEYS.map((pcc) => (
                            <Radio
                                key={pcc}
                                value={pcc}
                                style={{ display: "block" }}
                            >
                                <List.Item
                                    style={{
                                        display: "inline-block",
                                        verticalAlign: "top",
                                        paddingTop: "2px",
                                        paddingRight: "16px",
                                        whiteSpace: "normal",
                                    }}
                                >
                                    <List.Item.Meta
                                        title={
                                            PRIMARY_CONSENT_CODE_INFO[pcc].title
                                        }
                                        description={
                                            PRIMARY_CONSENT_CODE_INFO[pcc]
                                                .content
                                        }
                                    />
                                </List.Item>
                            </Radio>
                        ))}
                    </List>
                </Radio.Group>

                <div style={{ fontWeight: "bold" }}>Secondary</div>
                <List itemLayout="horizontal" style={{ maxWidth: "600px" }}>
                    {SECONDARY_CONSENT_CODE_KEYS.map((scc) => (
                        <List.Item key={scc}>
                            <List.Item.Meta
                                title={
                                    <Checkbox
                                        checked={consentCode.secondary_categories
                                            .map((c) => c.code)
                                            .includes(scc)}
                                        onChange={(e) =>
                                            handleSCCChange(e, scc)
                                        }
                                    >
                                        {SECONDARY_CONSENT_CODE_INFO[scc].title}
                                    </Checkbox>
                                }
                                description={
                                    <div style={{ marginLeft: "24px" }}>
                                        {
                                            SECONDARY_CONSENT_CODE_INFO[scc]
                                                .content
                                        }
                                    </div>
                                }
                            />
                        </List.Item>
                    ))}
                </List>
            </div>
            <div style={{ marginTop: "20px" }}>
                <Typography.Title level={4}>
                    Restrictions and Conditions
                </Typography.Title>
                <List
                    itemLayout="horizontal"
                    style={{ maxWidth: "600px" }}
                    dataSource={DATA_USE_KEYS}
                    renderItem={(u) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    u === DUO_NOT_FOR_PROFIT_USE_ONLY ? (
                                        // Special case for non-profit use; stack two icons (dollar + stop) to
                                        // create a custom synthetic icon.
                                        <div style={{ opacity: 0.65 }}>
                                            <Icon
                                                style={{
                                                    fontSize: "24px",
                                                    color: "black",
                                                }}
                                                type={DATA_USE_INFO[u].icon}
                                            />
                                            <Icon
                                                style={{
                                                    fontSize: "24px",
                                                    marginLeft: "-24px",
                                                    color: "black",
                                                }}
                                                type="stop"
                                            />
                                        </div>
                                    ) : (
                                        <Icon
                                            style={{ fontSize: "24px" }}
                                            type={DATA_USE_INFO[u].icon}
                                        />
                                    )
                                }
                                title={
                                    <Checkbox
                                        checked={dataUseRequirements
                                            .map((c) => c.code)
                                            .includes(u)}
                                        onChange={(e) => handleDURChange(e, u)}
                                    >
                                        {DATA_USE_INFO[u].title}
                                    </Checkbox>
                                }
                                description={DATA_USE_INFO[u].content}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </>
    );
};

DataUseInput.propTypes = {
    value: DATA_USE_PROP_TYPE_SHAPE,
    onChange: PropTypes.func,
};

export default memo(DataUseInput);
