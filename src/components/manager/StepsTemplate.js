import React from "react";
import PropTypes from "prop-types";
import { Form, Layout, Steps } from "antd";
const { Step } = Steps;

import { FORM_LABEL_COL, FORM_WRAPPER_COL } from "./ingestion";

import { LAYOUT_CONTENT_STYLE } from "../../styles/layoutContent";

const StepsTemplate = ({ steps, step, setStep }) => {
    return (
        <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Steps current={step} onChange={setStep}>
                    {steps.map((e, i) => (
                        <Step title={e.title} description={e.description} disabled={e?.disabled} key={i} />
                    ))}
                </Steps>
                <div style={{ marginTop: "16px" }}>
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        {steps[step].stepComponent}
                    </Form>
                </div>
            </Layout.Content>
        </Layout>
    );
};

StepsTemplate.propTypes = {
    steps: PropTypes.array.isRequired,
    step: PropTypes.number.isRequired,
    setStep: PropTypes.func.isRequired,
};

export default StepsTemplate;
