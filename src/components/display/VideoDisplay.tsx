import { type CSSProperties, useEffect, useRef } from "react";

const VIDEO_STYLE: CSSProperties = { width: "100%" };

type VideoDisplayProps = {
  blob: Blob;
};

const VideoDisplay = ({ blob }: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && blob) {
      videoRef.current.src = URL.createObjectURL(blob);
    }
  }, [videoRef, blob]);

  return <video style={VIDEO_STYLE} ref={videoRef} controls={true} />;
};

export default VideoDisplay;
