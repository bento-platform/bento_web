import { Link } from "react-router-dom";
import type { BentoMenuItem } from "@/types/menu";
import type { ItemType } from "antd/es/menu/interface";

// Custom menu renderer
export const transformMenuItem = (i: BentoMenuItem): ItemType => {
  const baseItem = {
    key: "key" in i ? i.key : i.url,
    style: i.style ?? {},
    disabled: i.disabled ?? false,
  };

  const text =
    typeof i.text === "string" ? (
      <span className="nav-text" style={i.textStyle}>
        {i.text}
      </span>
    ) : (
      (i.text ?? null)
    );

  if (i.hasOwnProperty("children")) {
    return {
      ...baseItem,
      label: (
        <span className="submenu-title-wrapper">
          {i.icon}
          {text}
          {i.iconAfter ? <span className="nav-icon-after">{i.iconAfter}</span> : null}
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
          {i.icon}
          {text}
          {i.iconAfter ? <span className="nav-icon-after">{i.iconAfter}</span> : null}
        </Link>
      ) : (
        <span>
          {i.icon}
          {text}
          {i.iconAfter ? <span className="nav-icon-after">{i.iconAfter}</span> : null}
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
