import { type CSSProperties, useEffect, useRef } from "react";
import { Spin } from "antd";

const VIDEO_STYLE: CSSProperties = { width: "100%" };

type VideoDisplayProps = {
  blob: Blob;
  loading?: boolean;
};

const VideoDisplay = ({ blob, loading }: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && blob) {
      videoRef.current.src = URL.createObjectURL(blob);
    }
  }, [videoRef, blob]);

  return (
    <Spin spinning={loading}>
      <video style={VIDEO_STYLE} ref={videoRef} controls={true} />
    </Spin>
  );
};

export default VideoDisplay;
