import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const AudioDisplay = ({blob}) => {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current && blob) {
            audioRef.current.src = URL.createObjectURL(blob);
        }
    }, [audioRef, blob]);

    return <audio style={{ width: "100%" }} ref={audioRef} controls={true} />;
};
AudioDisplay.propTypes = {
    blob: PropTypes.instanceOf(Blob),
};

export default AudioDisplay;
