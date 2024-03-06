import React, {Component} from "react";
import PropTypes from "prop-types";

import { Checkbox, List, Radio, Space, Typography } from "antd";

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
import { StopOutlined } from "@ant-design/icons";

const sortSCC = (a, b) => SECONDARY_CONSENT_CODE_KEYS.indexOf(a.code) - SECONDARY_CONSENT_CODE_KEYS.indexOf(b.code);
const sortDUR = (a, b) => DATA_USE_KEYS.indexOf(a.code) - DATA_USE_KEYS.indexOf(b.code);

class DataUseInput extends Component {
    static getDerivedStateFromProps(nextProps) {
        return "value" in nextProps
            ? {...(nextProps.value ?? {})}
            : null;
    }

    constructor(props) {
        super(props);

        const value = this.props.value ?? {};
        this.state = {
            consent_code: {
                primary_category: value.consent_code?.primary_category ?? null,
                secondary_categories: [...(value.consent_code?.secondary_categories ?? [])],
            },
            data_use_requirements: [...(value.data_use_requirements ?? [])],
        };

        this.triggerChange = this.triggerChange.bind(this);
        this.handleSCCChange = this.handleSCCChange.bind(this);
        this.handleDURChange = this.handleDURChange.bind(this);
    }

    triggerChange(change) {
        if (!("value" in this.props)) this.setState(change);
        if (this.props.onChange) {
            this.props.onChange({...this.state, ...change});
        }
    }

    handlePCCChange(code) {
        this.triggerChange({
            consent_code: {
                ...this.state.consent_code,
                primary_category: {code},
            },
        });
    }

    handleSCCChange(event, code) {
        this.triggerChange({
            consent_code: {
                ...this.state.consent_code,
                secondary_categories: event.target.checked
                    ? [...this.state.consent_code.secondary_categories, {code}].sort(sortSCC)
                    : this.state.consent_code.secondary_categories.filter(c => c.code !== code),
            },
        });
    }

    handleDURChange(event, code) {
        this.triggerChange({
            data_use_requirements: event.target.checked
                ? [...this.state.data_use_requirements, {code}].sort(sortDUR)
                : this.state.data_use_requirements.filter(c => c.code !== code),
        });
    }

    render() {
        return <>
            <div>
                <Typography.Title level={4} style={{fontSize: "20px"}}>Consent Code</Typography.Title>

                <Typography.Title level={5}>Primary</Typography.Title>
                <Radio.Group name="primary_consent_code"
                             value={(this.state.consent_code.primary_category ?? {code: null}).code}
                             onChange={e => this.handlePCCChange(e.target.value)}>
                    <Space direction="vertical">
                        {PRIMARY_CONSENT_CODE_KEYS.map((pcc) => (
                            <Radio key={pcc} value={pcc}>
                                <div style={{ maxWidth: 800 }}>
                                    {/* Replicate the style of list item without all the extra bloat / styling mishaps
                                      * that come with putting it inside a Radio. */}
                                    <Typography.Title level={5} style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: "rgba(0, 0, 0, 0.85)",
                                        marginBottom: 4,
                                    }}>
                                        {PRIMARY_CONSENT_CODE_INFO[pcc].title}
                                    </Typography.Title>
                                    <Typography.Paragraph style={{ marginBottom: 0, color: "rgba(0, 0, 0, 0.45)" }}>
                                        {PRIMARY_CONSENT_CODE_INFO[pcc].content}
                                    </Typography.Paragraph>
                                </div>
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>

                <Typography.Title level={5} style={{ marginTop: 16 }}>Secondary</Typography.Title>
                <List itemLayout="horizontal" style={{ maxWidth: 800 }}>
                    {SECONDARY_CONSENT_CODE_KEYS.map(scc =>
                        <List.Item key={scc}>
                            <List.Item.Meta title={
                                <Checkbox checked={
                                    this.state.consent_code.secondary_categories
                                        .map(c => c.code)
                                        .includes(scc)
                                } onChange={e => this.handleSCCChange(e, scc)}>
                                    {SECONDARY_CONSENT_CODE_INFO[scc].title}
                                </Checkbox>
                            } description={<div style={{marginLeft: "24px"}}>
                                {SECONDARY_CONSENT_CODE_INFO[scc].content}
                            </div>} />
                        </List.Item>,
                    )}
                </List>
            </div>
            <div style={{marginTop: "20px"}}>
                <Typography.Title level={4}>
                    Restrictions and Conditions
                </Typography.Title>
                <List itemLayout="horizontal" style={{ maxWidth: 800 }}
                      dataSource={DATA_USE_KEYS}
                      renderItem={u => {
                          const { title, content, Icon } = DATA_USE_INFO[u];
                          return (
                              <List.Item>
                                  <List.Item.Meta avatar={
                                      u === DUO_NOT_FOR_PROFIT_USE_ONLY ? (
                                          // Special case for non-profit use; stack two icons (dollar + stop) to
                                          // create a custom synthetic icon.
                                          <div style={{opacity: 0.65}}>
                                              <Icon style={{fontSize: "24px", color: "black"}} />
                                              <StopOutlined
                                                  style={{fontSize: "24px", marginLeft: "-24px", color: "black"}} />
                                          </div>
                                      ) : <Icon style={{fontSize: "24px"}} />
                                  } title={
                                      <Checkbox checked={this.state.data_use_requirements.map(c => c.code).includes(u)}
                                                onChange={e => this.handleDURChange(e, u)}>
                                          {title}
                                      </Checkbox>
                                  } description={content} />
                              </List.Item>
                          );
                      }} />
            </div>
        </>;
    }
}

DataUseInput.propTypes = {
    value: DATA_USE_PROP_TYPE_SHAPE,
    onChange: PropTypes.func,
};

export default DataUseInput;
