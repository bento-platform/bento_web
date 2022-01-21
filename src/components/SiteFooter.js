import React, {Component} from "react";
import {Layout} from "antd";
import {withBasePath} from "../utils/url";
import BentoLogo from "../images/Bento_final.svg";

const BENTO_LOGO_WIDTH = "200px"

class SiteFooter extends Component {
    render() {
        return (
          <Layout.Footer>
            <div
              style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <h2 style={{margin: "0"}}>Powered by</h2>
                </div>

                <div style={{ width: BENTO_LOGO_WIDTH, marginLeft: "10px" }}>
                  <img src={BentoLogo} alt="Bento logo" />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                Copyright &copy; 2019-2022 the{" "}
                <a href="http://computationalgenomics.ca">Canadian Centre for Computational Genomics</a>.{" "}
                <br />
                <span style={{ fontFamily: "monospace" }}>bento_web</span> is licensed under the{" "}
                <a href={withBasePath("public/LICENSE.txt")}>LGPLv3</a>. The source code is available{" "}
                <a href="https://github.com/bento-platform/bento_web">on GitHub</a>.
              </div>
            </div>
          </Layout.Footer>
        );
    }
}

export default SiteFooter;
