import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { Spin } from "antd";
import type { BlobDisplayProps } from "./types";

const styles: Record<string, CSSProperties> = {
  container: { width: "100%", position: "relative" },
  img: { maxWidth: "100%", height: "auto", position: "relative", top: 0 },
};

interface ImageBlobDisplayProps extends BlobDisplayProps {
  alt: string;
}

const ImageBlobDisplay = ({ alt, contents, loading }: ImageBlobDisplayProps) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && contents) {
      imgRef.current.src = URL.createObjectURL(contents);
    }
  }, [imgRef, contents]);

  const imgStyle = useMemo(() => ({ ...styles.img, opacity: loading ? 0 : 1 }), [loading]);

  return (
    <div style={styles.container}>
      {loading && (
        <Spin spinning={true}>
          <div style={{ width: "100%", height: 200 }} />
        </Spin>
      )}
      <img alt={alt} ref={imgRef} style={imgStyle} />
    </div>
  );
};

export default ImageBlobDisplay;
