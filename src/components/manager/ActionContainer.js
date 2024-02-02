import React from "react";

const style = {
    display: "flex",
    gap: "12px",
    alignItems: "baseline",
    position: "sticky",
    paddingBottom: 4,
    backgroundColor: "white",
    boxShadow: "0 10px 10px white, 0 -10px 0 white",
    top: 8,
    zIndex: 10,
};

const ActionContainer = ({ children, ...props }) => {
    return (
        <div style={style} {...props}>
            {children}
        </div>
    );
};

export default ActionContainer;
