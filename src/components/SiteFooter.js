import React from "react";
import { Layout, Typography } from "antd";

import pkg from "../../package.json";

import BentoLogo from "../images/logo_colour.svg";
import MonospaceText from "@/components/MonospaceText";

const BENTO_LOGO_WIDTH = "148px";

const SiteFooter = React.memo(() => (
    <Layout.Footer>
        <div style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <div style={{ marginBottom: 8 }}>
                <div>
                    <p style={{ margin: 0, color: "rgba(0, 0, 0, 0.65)" }}>Powered by</p>
                </div>
                <div style={{ width: BENTO_LOGO_WIDTH }}>
                    <a href="https://bento-platform.github.io" target="_blank" rel="noreferrer">
                        <img src={BentoLogo} alt="Bento logo" />
                    </a>
                </div>
            </div>

            <Typography.Paragraph style={{ textAlign: "center", marginBottom: 0 }}>
                Copyright &copy; 2019-2024 the{" "}
                <a href="https://computationalgenomics.ca">Canadian Centre for Computational Genomics</a>.{" "}
                <br />
                <MonospaceText>bento_web</MonospaceText> (v{pkg.version}) is licensed under the{" "}
                <a href="https://github.com/bento-platform/bento_web/blob/master/LICENSE">LGPLv3</a>. The
                source code is available <a href="https://github.com/bento-platform/bento_web">on GitHub</a>.
            </Typography.Paragraph>
        </div>
    </Layout.Footer>
));

export default SiteFooter;
