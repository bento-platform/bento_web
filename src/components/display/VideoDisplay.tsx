import { type CSSProperties, useEffect, useRef } from "react";
import { Spin } from "antd";
import type { BlobDisplayProps } from "./types";

const VIDEO_STYLE: CSSProperties = { width: "100%" };

const VideoDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && contents) {
      videoRef.current.src = URL.createObjectURL(contents);
    }
  }, [videoRef, contents]);

  return (
    <Spin spinning={loading}>
      <video style={VIDEO_STYLE} ref={videoRef} controls={true} />
    </Spin>
  );
};

export default VideoDisplay;
