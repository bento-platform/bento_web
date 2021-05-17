import React, {Component} from "react";

import {Layout} from "antd";

import {withBasePath} from "../utils/url";

class SiteFooter extends Component {
    render() {
        return <Layout.Footer style={{textAlign: "center"}}>
            Copyright &copy; 2019-2020 the <a href="http://computationalgenomics.ca">Canadian Centre for
            Computational Genomics</a>. <br/>
            <span style={{fontFamily: "monospace"}}>bento_web</span> is licensed under
            the <a href={withBasePath("public/LICENSE.txt")}>LGPLv3</a>. The source code is
            available <a href="https://github.com/bento-platform/bento_web">on GitHub</a>.
        </Layout.Footer>;
    }
}

export default SiteFooter;
