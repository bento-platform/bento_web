import type { CSSProperties, ReactNode } from "react";

interface BentoBaseMenuItem {
    text?: string;
    disabled?: boolean;
    icon?: ReactNode;
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
