import React, {useMemo} from "react";
import PropTypes from "prop-types";
import {TreeSelect} from "antd";
import {useSelector} from "react-redux";

import {dropBoxTreeStateToPropsMixin} from "../../propTypes";
import {getTrue} from "../../utils/misc";

const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid, folderMode, basePrefix) =>
    [...directory]
        .sort(sortByName)
        .filter(entry => !folderMode || entry.contents !== undefined)  // Don't show files in folder mode
        .map(entry => {
            const {name, contents, relativePath} = entry;
            const isValid = valid(entry);
            const isFolder = contents !== undefined;

            let renderAsLeaf = !isFolder;
            if (folderMode && isFolder) {
                // See if we have at least one nested child... otherwise, render this as a leaf in folder mode.
                renderAsLeaf = contents.findIndex(c => c.contents !== undefined) === -1;
            }

            const k = (basePrefix ?? "") + relativePath;

            return (
                <TreeSelect.TreeNode
                    title={name}
                    key={k}
                    value={k}
                    disabled={!isValid}
                    isLeaf={renderAsLeaf}
                    selectable={folderMode ? isFolder : !isFolder}
                >
                    {isFolder ? generateFileTree(contents, valid, folderMode, basePrefix) : null}
                </TreeSelect.TreeNode>
            );
        });

const DropBoxTreeSelect = React.forwardRef(({folderMode, nodeEnabled, basePrefix, ...props}, ref) => {
    const {tree} = useSelector(dropBoxTreeStateToPropsMixin);

    const fileTree = useMemo(
        () => generateFileTree(tree, nodeEnabled ?? getTrue, folderMode, basePrefix),
        [tree, nodeEnabled, folderMode, basePrefix],
    );

    return <TreeSelect ref={ref} showSearch={true} treeDefaultExpandAll={true} {...props}>
        <TreeSelect.TreeNode title="Drop Box" value={basePrefix ?? "/"} selectable={folderMode}>
            {fileTree}
        </TreeSelect.TreeNode>
    </TreeSelect>;
});

DropBoxTreeSelect.propTypes = {
    folderMode: PropTypes.bool,
    nodeEnabled: PropTypes.func,
    basePrefix: PropTypes.string,
};

DropBoxTreeSelect.defaultProps = {
    folderMode: false,
};

export default DropBoxTreeSelect;
