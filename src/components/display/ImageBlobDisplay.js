import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const ImageBlobDisplay = ({ alt, blob }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && blob) {
      imgRef.current.src = URL.createObjectURL(blob);
    }
  }, [imgRef, blob]);

  return (
    <div style={{ width: "100%" }}>
      <img alt={alt} ref={imgRef} style={{ maxWidth: "100%", height: "auto" }} />
    </div>
  );
};
ImageBlobDisplay.propTypes = {
  alt: PropTypes.string,
  blob: PropTypes.instanceOf(Blob),
};

export default ImageBlobDisplay;
