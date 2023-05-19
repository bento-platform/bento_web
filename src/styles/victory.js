// noinspection JSUnusedGlobalSymbols
export const VICTORY_PIE_PROPS = {
    standalone: false,
    innerRadius: ({radius}) => radius * (7 / 10),
    // labelRadius: ({innerRadius, radius}) => innerRadius({radius}) + (radius - innerRadius({radius})) / 2,
    // style: {labels: {fill: "white", textAnchor: "middle"}},
    padding: {left: 120, right: 120, top: 40, bottom: 40},
    labelPadding: 20,
    height: 250,
    labels: ({datum}) => `${datum.x}: ${datum.y}`,
    style: {labels: {fontFamily: "monospace"}},
};

export const VICTORY_PIE_LABEL_PROPS = {
    textAnchor: "middle",
    x: 200,
    y: 125,
    style: {fontFamily: "monospace"},
};

export const VICTORY_BAR_CONTAINER_PROPS = {
    padding: {left: 120, right: 40, top: 60, bottom: 120},
    height: 340,
};

// noinspection JSUnusedGlobalSymbols
export const VICTORY_BAR_PROPS = {
    labels: ({datum}) => datum.y.toString(),
    style: {labels: {fontFamily: "monospace", fontSize: "12px"}},
};

export const VICTORY_BAR_TITLE_PROPS = {
    textAnchor: "middle",
    x: 225,
    y: 20,
    style: {fontFamily: "monospace"},
};

export const VICTORY_BAR_TITLE_PROPS_WITHOUT_MONOSPACE = {
    textAnchor: "middle",
    x: 175,
    y: 20,
};

export const VICTORY_BAR_X_AXIS_PROPS = {
    style: {
        tickLabels: {
            angle: -40,
            fontFamily: "monospace",
            fontSize: "11px",
            textAnchor: "end",
            letterSpacing: "-1.5px",
        },
    },
};

export const VICTORY_HIST_CONTAINER_PROPS = {
    ...VICTORY_BAR_CONTAINER_PROPS,
    padding: {left: 40, right: 40, top: 60, bottom: 40},
};

export const VICTORY_HIST_PROPS = {
    ...VICTORY_BAR_PROPS,
};
