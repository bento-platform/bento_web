import React from "react";
import PropTypes from "prop-types";

import {Tree} from "antd";

import {generateSchemaTreeData} from "../../utils/schema";

const SchemaTree = ({schema}) => (
    <div>
        {schema
            ? <Tree defaultExpandAll={true} treeData={[generateSchemaTreeData(schema)]} />
            : null}
    </div>
);
SchemaTree.propTypes = {
    schema: PropTypes.object,
};

export default SchemaTree;
