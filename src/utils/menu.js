import React from "react";
import {Link} from "react-router-dom";

import {Menu} from "antd";

// Custom menu renderer
export const transformMenuItem = (i, level = 0) => {
    const baseItem = {
        key: i.key ?? i.url,
        style: i.style ?? {},
        disabled: i.disabled ?? false,
    };

    if (i.hasOwnProperty("children")) {
        return {
            ...baseItem,
            label: (
                <span className="submenu-title-wrapper">
                    {i.icon ?? null}
                    {i.text ? <span className="nav-text">{i.text}</span> : null}
                </span>
            ),
            children: (i.children ?? []).map((ii) => transformMenuItem(ii)),
        };
    }

    return {
        ...baseItem,
        label: i.url ? (
            <Link to={i.url}>
                {i.icon ?? null}
                {i.text ? <span className="nav-text">{i.text}</span> : null}
            </Link>
        ) : (
            <span {...(i.onClick ? {onClick: i.onClick} : {})}>
                {i.icon ?? null}
                {i.text ? <span className="nav-text">{i.text}</span> : null}
            </span>
        ),
    };
};

export const matchingMenuKeys = menuItems => menuItems
    .filter(i => (i.url && window.location.pathname.startsWith(i.url)) || (i.children ?? []).length > 0)
    .flatMap(i => [i.key ?? i.url ?? "", ...matchingMenuKeys(i.children ?? [])]);
