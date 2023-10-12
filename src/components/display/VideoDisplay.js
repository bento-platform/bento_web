import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const VideoDisplay = ({blob}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && blob) {
            videoRef.current.src = URL.createObjectURL(blob);
        }
    }, [videoRef, blob]);

    return <video style={{ width: "100%" }} ref={videoRef} controls={true} />;
};
VideoDisplay.propTypes = {
    blob: PropTypes.instanceOf(Blob),
};

export default VideoDisplay;
