import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { TreeSelect, Form } from "antd";

import { getTrue } from "@/utils/misc";
import { useDropBoxFileContent } from "@/hooks";
import { BENTO_DROP_BOX_FS_BASE_PATH } from "@/config";
import { dropBoxTreeNodeEnabledJson } from "@/utils/files";
import JsonDisplay from "../display/JsonDisplay";
import { useDropBox } from "@/modules/manager/hooks";

const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid, folderMode, basePrefix) =>
    [...directory]
        .sort(sortByName)
        .filter(entry => !folderMode || entry.contents !== undefined)  // Don't show files in folder mode
        .map(entry => {
            const { name, contents, relativePath } = entry;
            const isValid = valid(entry);
            const isFolder = contents !== undefined;

            let renderAsLeaf = !isFolder;
            if (folderMode && isFolder) {
                // See if we have at least one nested child... otherwise, render this as a leaf in folder mode.
                renderAsLeaf = contents.findIndex(c => c.contents !== undefined) === -1;
            }

            const k = (basePrefix ?? "") + relativePath;

            return {
                value: k,
                title: name,
                disabled: !isValid,
                isLeaf: renderAsLeaf,
                selectable: folderMode ? isFolder : !isFolder,
                ...(isFolder && {
                    children: generateFileTree(contents, valid, folderMode, basePrefix),
                }),
            };
        });

const DropBoxTreeSelect = React.forwardRef(({ folderMode, nodeEnabled, basePrefix, ...props }, ref) => {
    const { tree } = useDropBox();

    const fileTree = useMemo(
        () => generateFileTree(tree, nodeEnabled ?? getTrue, folderMode, basePrefix),
        [tree, nodeEnabled, folderMode, basePrefix],
    );

    return <TreeSelect
        ref={ref}
        showSearch={true}
        treeDefaultExpandAll={true}
        treeData={[{
            value: basePrefix ?? "/",
            title: "Drop Box",
            selectable: folderMode,
            children: fileTree,
        }]}
        {...props}
    />;
});

DropBoxTreeSelect.propTypes = {
    folderMode: PropTypes.bool,
    nodeEnabled: PropTypes.func,
    basePrefix: PropTypes.string,
};

DropBoxTreeSelect.defaultProps = {
    folderMode: false,
};

export const DropBoxJsonSelect = ({ form, name, labels, initialValue, rules }) => {
    const pathName = name + "Path";
    const filePath = Form.useWatch(pathName, form);
    const fileContent = useDropBoxFileContent(filePath);
    const currentFieldData = fileContent || initialValue;

    const contentLabel = (filePath && labels?.updatedContent) ? labels.updatedContent : labels.defaultContent;

    useEffect(() => {
        form.setFieldValue(name, currentFieldData);
    }, [form, name, currentFieldData]);

    return (
        <Form.Item label={labels.parent}>
            <Form.Item
                label={labels.select}
                name={pathName}
            >
                <DropBoxTreeSelect
                    key={pathName}
                    basePrefix={BENTO_DROP_BOX_FS_BASE_PATH}
                    multiple={false}
                    nodeEnabled={dropBoxTreeNodeEnabledJson}
                    allowClear={true}
                />
            </Form.Item>
            <Form.Item
                label={contentLabel}
                name={name}
                hidden={!currentFieldData}
                rules={rules}
            >
                <JsonDisplay showObjectWithReactJson jsonSrc={currentFieldData} />
            </Form.Item>
        </Form.Item>
    );
};


DropBoxJsonSelect.propTypes = {
    form: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    labels: PropTypes.shape({
        parent: PropTypes.node.isRequired,
        select: PropTypes.node.isRequired,
        defaultContent: PropTypes.node.isRequired,
        updatedContent: PropTypes.node,
    }),
    initialValue: PropTypes.object,
    rules: PropTypes.array,
};

export default DropBoxTreeSelect;
