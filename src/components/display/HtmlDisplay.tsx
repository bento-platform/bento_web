import { useEffect, useId, useState } from "react";
import { Spin } from "antd";

import type { BlobDisplayProps } from "./types";
import { LoadingOutlined } from "@ant-design/icons";

const HtmlDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const iframeId = useId();

  const [isConverting, setIsConverting] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);

  // Effect used to define the iframe load listener used to turn off the iframe loading state after the iframe has
  // finished loading the specified srcdoc (derived from contents.)
  useEffect(() => {
    const iframe = document.getElementById(iframeId);
    const listener = () => {
      setIframeLoading(false);
    };
    iframe?.addEventListener("load", listener);
    return () => iframe?.removeEventListener("load", listener);
  }, [iframeId]);

  useEffect(() => {
    if (!contents) return;

    setIsConverting(true);

    contents
      .text()
      .then((html) => {
        // If there isn't already a <base ...> tag, instruct the embedded HTML to open links in the parent (i.e., here)
        // instead of inside the iframe.
        let modifiedHtml = html;
        if (!modifiedHtml.includes("<base target") && !modifiedHtml.includes("<base href")) {
          // noinspection HtmlRequiredTitleElement
          modifiedHtml = modifiedHtml.replace("<head>", '<head><base target="_parent" />');
        }

        // When we update the srcdoc attribute, it'll cause the iframe to re-load the content.
        // When it finishes loading, it'll trigger a load event listener on the iframe, defined above in another
        // useEffect, which turns iframeLoading back off. This process lets us render a loading indicator.
        document.getElementById(iframeId)?.setAttribute("srcdoc", modifiedHtml);
        setIframeLoading(true);
      })
      .finally(() => setIsConverting(false));
  }, [iframeId, contents]);

  // Three different loading states:
  //  - loading bytes from server
  //  - converting bytes to text (essentially instant)
  //  - iframe loading/rendering HTML - triggered by updating the srcdoc attribute
  const isLoading = loading || isConverting || iframeLoading;

  return (
    <Spin spinning={isLoading} size="large" indicator={<LoadingOutlined spin={true} />}>
      <iframe
        id={iframeId}
        sandbox="allow-downloads allow-scripts allow-top-navigation"
        style={{
          width: "90vw",
          // Height of the iframe is 100% of the view height
          // minus its border (2px)
          // minus the padding of the parent modal (40px)
          // minus the header of the modal (32px)
          // minus a top and bottom outside margin set by the modal (50px top, matched bottom)
          height: "calc(100vh - 2px - 40px - 32px - 100px)",
          border: "1px solid #C6C6C6",
          borderRadius: 3,
        }}
      ></iframe>
    </Spin>
  );
};

export default HtmlDisplay;
