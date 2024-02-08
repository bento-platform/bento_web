import React from "react";
import {Link} from "react-router-dom";

// Custom menu renderer
export const transformMenuItem = (i) => {
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
        ...(i.onClick ? {onClick: i.onClick} : {}),
        label: i.url ? (
            <Link to={i.url}>
                {i.icon ?? null}
                {i.text ? <span className="nav-text">{i.text}</span> : null}
            </Link>
        ) : (
            <span>
                {i.icon ?? null}
                {i.text ? <span className="nav-text">{i.text}</span> : null}
            </span>
        ),
    };
};

export const matchingMenuKeys = menuItems => menuItems
    .filter(i => (i.url && window.location.pathname.startsWith(i.url)) || (i.children ?? []).length > 0)
    .flatMap(i => [i.key ?? i.url ?? "", ...matchingMenuKeys(i.children ?? [])]);
