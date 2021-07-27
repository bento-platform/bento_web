import React, {Component} from "react";

import {Layout, Typography} from "antd";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ExplorerGenomeBrowserContent extends Component {
    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={4}>Variant Visualizer</Typography.Title>
                TODO
                {/*<GenomeBrowser variantTable={this.props.variantTable} />*/}
            </Layout.Content>
        </Layout>;
    }
}

export default ExplorerGenomeBrowserContent;
