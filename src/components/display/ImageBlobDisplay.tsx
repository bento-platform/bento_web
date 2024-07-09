import { type CSSProperties, useEffect, useRef } from "react";

const styles: Record<string, CSSProperties> = {
  container: { width: "100%" },
  img: { maxWidth: "100%", height: "auto" },
};

type ImageBlobDisplayProps = {
  alt: string;
  blob: Blob;
};

const ImageBlobDisplay = ({ alt, blob }: ImageBlobDisplayProps) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && blob) {
      imgRef.current.src = URL.createObjectURL(blob);
    }
  }, [imgRef, blob]);

  return (
    <div style={styles.container}>
      <img alt={alt} ref={imgRef} style={styles.img} />
    </div>
  );
};

export default ImageBlobDisplay;
