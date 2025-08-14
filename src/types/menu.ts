import type { CSSProperties, ReactElement, ReactNode } from "react";

interface BentoBaseMenuItem {
  text?: ReactElement | string;
  textStyle?: CSSProperties;
  disabled?: boolean;
  icon?: ReactNode;
  iconAfter?: ReactNode;
  style?: CSSProperties;
  children?: BentoMenuItem[];
  onClick?: () => void;
}

interface BentoKeyMenuItem extends BentoBaseMenuItem {
  key: string;
}

interface BentoURLMenuItem extends BentoBaseMenuItem {
  url: string;
}

export type BentoMenuItem = BentoKeyMenuItem | BentoURLMenuItem;
