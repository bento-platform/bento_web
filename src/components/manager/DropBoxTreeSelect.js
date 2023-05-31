import React from "react";
import PropTypes from "prop-types";
import {TreeSelect} from "antd";
import {useSelector} from "react-redux";

import {dropBoxTreeStateToPropsMixin} from "../../propTypes";

const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid, folderMode) =>
    [...directory]
        .sort(sortByName)
        .filter(entry => !folderMode || entry.contents !== undefined)  // Don't show files in folder mode
        .map(entry => {
            const {name, filePath, contents} = entry;
            const isValid = valid(entry);
            const isFolder = contents !== undefined;

            let renderAsLeaf = !isFolder;
            if (folderMode && isFolder) {
                // See if we have at least one nested child... otherwise, render this as a leaf in folder mode.
                renderAsLeaf = contents.findIndex(c => c.contents !== undefined) === -1;
            }

            return (
                <TreeSelect.TreeNode
                    title={name}
                    key={filePath}
                    value={filePath}
                    disabled={!isValid}
                    isLeaf={renderAsLeaf}
                    selectable={folderMode ? isFolder : !isFolder}
                >
                    {isFolder ? generateFileTree(contents, valid, folderMode) : null}
                </TreeSelect.TreeNode>
            );
        });

const getTrue = () => true;

const DropBoxTreeSelect = React.forwardRef(({folderMode, nodeEnabled, ...props}, ref) => {
    const {tree} = useSelector(dropBoxTreeStateToPropsMixin);

    return <TreeSelect ref={ref} showSearch={true} treeDefaultExpandAll={true} {...props}>
        <TreeSelect.TreeNode title="Drop Box" key="root" value="/" selectable={folderMode}>
            {generateFileTree(tree, nodeEnabled ?? getTrue, folderMode)}
        </TreeSelect.TreeNode>
    </TreeSelect>;
});

DropBoxTreeSelect.propTypes = {
    folderMode: PropTypes.bool,
    nodeEnabled: PropTypes.func,
};

DropBoxTreeSelect.defaultProps = {
    folderMode: false,
};

export default DropBoxTreeSelect;
