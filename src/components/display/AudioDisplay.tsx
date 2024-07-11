import { useEffect, useRef } from "react";
import { Skeleton } from "antd";

type AudioDisplayProps = {
  blob: Blob;
  loading?: boolean;
};

const AudioDisplay = ({ blob, loading }: AudioDisplayProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && blob) {
      audioRef.current.src = URL.createObjectURL(blob);
    }
  }, [audioRef, blob]);

  return (
    <>
      <Skeleton active={true} loading={loading} title={false} paragraph={{ rows: 1 }} />
      {!loading && <audio style={{ width: "100%" }} ref={audioRef} controls={true} />}
    </>
  );
};

export default AudioDisplay;
