import React from "react";

const TITLE_STYLE = {
    fontStyle: "italic",
    marginBottom: "10px",
};

const ChartContainer = ({ title, children }) => (
    <div style={{ marginBottom: "20px", width: "420px" }}>
        <h2 style={TITLE_STYLE}>{title}</h2>
        {children}
    </div>
);

export default ChartContainer;
