import React from "react";
import {Link} from "react-router-dom";

import {Menu} from "antd";

// Custom menu renderer
export const renderMenuItem = i => {
    if (i.hasOwnProperty("children")) {
        return <Menu.SubMenu style={i.style || {}}
                             disabled={i.disabled || false} title={
            <span className="submenu-title-wrapper">
                {i.icon || null}
                {i.text || null}
            </span>
        } key={i.key || ""}>
            {(i.children || []).map(ii => renderMenuItem(ii))}
        </Menu.SubMenu>;
    }

    return (
        <Menu.Item key={i.key || i.url || ""}
                   onClick={i.onClick || undefined}
                   style={i.style || {}}
                   disabled={i.disabled || false}>
            {i.url && !i.onClick ?
                <Link to={i.url}>
                    {i.icon || null}
                    {i.text || null}
                </Link> : <span>
                    {i.icon || null}
                    {i.text || null}
                </span>}
        </Menu.Item>
    );
};

export const matchingMenuKeys = menuItems => menuItems
    .filter(i => (i.url && window.location.pathname.startsWith(i.url)) || (i.children || []).length > 0)
    .flatMap(i => [i.key || i.url || "", ...matchingMenuKeys(i.children || [])]);
