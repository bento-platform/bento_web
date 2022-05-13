import React, { useState } from "react";

import { TreeSelect } from "antd";

import {
    ROOT_SCHEMA_ID,
    generateSchemaTreeData,
    getFieldSchema,
} from "../../utils/schema";
import PropTypes from "prop-types";

const SchemaTreeSelect = ({
    style,
    disabled,
    schema,
    isExcluded,
    onChange,
    value,
}) => {
    const [selected, setSelected] = useState(value?.selected);

    const onChangeLocal = (sel) => {
        // Set the state directly unless value is bound

        setSelected(sel);

        // Update the change handler bound to the component
        if (onChange) {
            onChange({ selected: sel, schema: getFieldSchema(schema, sel) });
        }
    };

    return (
        <TreeSelect
            style={style}
            disabled={disabled}
            placeholder="field"
            showSearch={true}
            treeDefaultExpandedKeys={schema ? [`${ROOT_SCHEMA_ID}`] : []}
            treeData={
                schema
                    ? [
                        generateSchemaTreeData(
                            schema,
                            ROOT_SCHEMA_ID,
                            "",
                            isExcluded
                        ),
                    ]
                    : []
            }
            value={selected}
            onChange={onChangeLocal}
            treeNodeLabelProp="titleSelected"
        />
    );
};

SchemaTreeSelect.propTypes = {
    style: PropTypes.object,
    disabled: PropTypes.bool,
    schema: PropTypes.object,
    isExcluded: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.object,
};

export default SchemaTreeSelect;
