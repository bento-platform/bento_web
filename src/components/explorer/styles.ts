import type { CSSProperties } from "react";

export const STYLE_FIX_NESTED_TABLE_MARGIN: CSSProperties = {
  // compensate for bad inner nested table styling:
  marginLeft: "-44px",
  padding: "16px 0",
};
