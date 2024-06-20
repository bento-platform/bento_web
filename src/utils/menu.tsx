import { Link } from "react-router-dom";
import type { BentoMenuItem } from "@/types/menu";
import { ItemType } from "antd/es/menu/hooks/useItems";

// Custom menu renderer
export const transformMenuItem = (i: BentoMenuItem): ItemType => {
  const baseItem = {
    key: "key" in i ? i.key : i.url,
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
    ...(i.onClick ? { onClick: i.onClick } : {}),
    label:
      "url" in i ? (
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

const currentUrlMatches = (i: BentoMenuItem) => "url" in i && window.location.pathname.startsWith(i.url);
export const matchingMenuKeys = (menuItems: BentoMenuItem[]): string[] =>
  menuItems
    .filter((i) => currentUrlMatches(i) || (i.children ?? []).length > 0)
    .flatMap((i) => [
      ...(currentUrlMatches(i) ? ["key" in i ? i.key : i.url] : []),
      ...matchingMenuKeys(i.children ?? []),
    ]);
