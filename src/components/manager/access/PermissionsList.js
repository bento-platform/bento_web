import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";

import { Typography } from "antd";

const PERMISSIONS_LIST_STYLE = { margin: 0, padding: 0, listStyle: "none", lineHeight: "1.6em" };

/**
 * @param {string[]} permissions
 * @return {React.JSX.Element}
 * @constructor
 */
const PermissionsList = ({ permissions }) => {
    const [showAll, setShowAll] = useState(false);

    const onShowAll = useCallback((e) => {
        setShowAll(true);
        e.preventDefault();
    }, []);

    const onCollapse = useCallback((e) => {
        setShowAll(false);
        e.preventDefault();
    }, []);

    return (
        <ul style={PERMISSIONS_LIST_STYLE}>
            {permissions.slice(0, showAll ? permissions.length : 4).map((p) => (
                <li key={p}>
                    <Typography.Text code={true}>{p}</Typography.Text>
                </li>
            ))}
            {permissions.length > 4 ? (
                showAll ? (
                    <li><a href="#" onClick={onCollapse}>- Collapse</a></li>
                ) : (
                    <li><a href="#" onClick={onShowAll}>+ {permissions.length - 4} more</a></li>
                )
            ) : null}
        </ul>
    );
};
PermissionsList.propTypes = {
    permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PermissionsList;
