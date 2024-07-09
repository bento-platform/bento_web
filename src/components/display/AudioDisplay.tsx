import { useEffect, useRef } from "react";

type AudioDisplayProps = {
  blob: Blob;
};

const AudioDisplay = ({ blob }: AudioDisplayProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && blob) {
      audioRef.current.src = URL.createObjectURL(blob);
    }
  }, [audioRef, blob]);

  return <audio style={{ width: "100%" }} ref={audioRef} controls={true} />;
};

export default AudioDisplay;
