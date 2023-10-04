import React, { useEffect, useRef } from "react";

const ImageBlobDisplay = ({alt, blob}) => {
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current && blob) {
            console.log(blob);
            imgRef.current.src = URL.createObjectURL(blob);
        }
    }, [imgRef, blob]);

    return <div style={{width: "100%"}}>
        <img alt={alt} ref={imgRef} style={{maxWidth: "100%", height: "auto"}} />
    </div>;
};

export default ImageBlobDisplay;
