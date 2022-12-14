import React from "react";
import {Layout} from "antd";

import pkg from "../../package.json";

import BentoLogo from "../images/logo_colour.svg";

const BENTO_LOGO_WIDTH = "125px";

const SiteFooter = React.memo(() => (
    <Layout.Footer>
        <div style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <div style={{marginBottom: 8}}>
                <div>
                    <p style={{margin: 0}}>Powered by</p>
                </div>
                <div style={{width: BENTO_LOGO_WIDTH}}>
                    <img src={BentoLogo} alt="Bento logo" />
                </div>
            </div>

            <div style={{textAlign: "center"}}>
                Copyright &copy; 2019-2022 the{" "}
                <a href="https://computationalgenomics.ca">Canadian Centre for Computational Genomics</a>.{" "}
                <br />
                <span style={{fontFamily: "monospace"}}>bento_web</span> (v{pkg.version}) is licensed under the{" "}
                <a href="https://github.com/bento-platform/bento_web/blob/master/LICENSE">LGPLv3</a>. The
                source code is available <a href="https://github.com/bento-platform/bento_web">on GitHub</a>.
            </div>
        </div>
    </Layout.Footer>
));

export default SiteFooter;
