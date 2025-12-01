import { type MouseEventHandler, useCallback } from "react";

import { Button, type ButtonProps } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import { useAccessToken } from "bento-auth-js";

import { AUDIO_FILE_EXTENSIONS, IMAGE_FILE_EXTENSIONS, VIDEO_FILE_EXTENSIONS } from "../display/FileDisplay";

const BROWSER_RENDERED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ...AUDIO_FILE_EXTENSIONS,
  ...IMAGE_FILE_EXTENSIONS,
  ...VIDEO_FILE_EXTENSIONS,
];

const FORM_ALLOWED_EXTRA_KEYS = new Set([
  "path", // Used by RunOutputs to download specific WES run artifacts
]);

interface DownloadButtonProps extends ButtonProps {
  uri: string;
  fileName?: string;
  extraFormData?: Record<string, string | number>;
  useBearerToken?: boolean;
}

const DownloadButton = ({
  uri,
  fileName,
  extraFormData,
  useBearerToken = false,
  children,
  onClick: propsOnClick,
  ...props
}: DownloadButtonProps) => {
  const accessToken = useAccessToken();

  const onClick = useCallback<MouseEventHandler<HTMLElement>>(
    async (e) => {
      if (!uri) return;

      if (useBearerToken) {
        // New behavior: use bearer token in Authorization header
        try {
          const headers: HeadersInit = {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          };

          const body = new URLSearchParams();
          Object.entries(extraFormData ?? {})
            .filter(([k, _]) => FORM_ALLOWED_EXTRA_KEYS.has(k)) // Only allowed extra keys
            .forEach(([k, v]) => {
              body.append(k, v.toString());
            });

          const response = await fetch(uri, {
            method: "POST",
            headers,
            body: body.toString() ? body : undefined,
          });

          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          if (fileName) {
            a.download = fileName;
          }

          if (fileName && BROWSER_RENDERED_EXTENSIONS.find((ext) => fileName.toLowerCase().endsWith(ext))) {
            // In Firefox, if we open, e.g., a PDF; it'll open in the PDF viewer instead of downloading.
            // Here, we force it to open in a new tab if it's render-able by the browser (although Chrome will actually
            // download the PDF file, so it'll flash a new tab - this is a compromise solution for viewable file types.)
            a.target = "_blank";
          }

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // Call the props-passed onClick event handler after doing our own thing
          if (propsOnClick) propsOnClick(e);
        } catch (error) {
          console.error("Download error:", error);
        }
      } else {
        // Old behavior: use form submission with token as form field
        const form = document.createElement("form");
        if (fileName && BROWSER_RENDERED_EXTENSIONS.find((ext) => fileName.toLowerCase().endsWith(ext))) {
          // In Firefox, if we open, e.g., a PDF; it'll open in the PDF viewer instead of downloading.
          // Here, we force it to open in a new tab if it's render-able by the browser (although Chrome will actually
          // download the PDF file, so it'll flash a new tab - this is a compromise solution for viewable file types.)
          form.target = "_blank";
        }
        form.method = "post";
        form.action = uri;

        const tokenInput = document.createElement("input");
        tokenInput.setAttribute("type", "hidden");
        tokenInput.setAttribute("name", "token");
        if (accessToken) tokenInput.setAttribute("value", accessToken);
        form.appendChild(tokenInput);

        Object.entries(extraFormData ?? {})
          .filter(([k, _]) => FORM_ALLOWED_EXTRA_KEYS.has(k)) // Only allowed extra keys
          .forEach(([k, v]) => {
            const extraInput = document.createElement("input");
            extraInput.setAttribute("type", "hidden");
            extraInput.setAttribute("name", k);
            extraInput.setAttribute("value", v.toString());
            form.appendChild(extraInput);
          });

        document.body.appendChild(form);

        try {
          form.submit();
        } finally {
          // Even if submit raises for some reason, we still need to clean this up; it has a token in it!
          document.body.removeChild(form);

          // Call the props-passed onClick event handler after hijacking the event and doing our own thing
          if (propsOnClick) propsOnClick(e);
        }
      }
    },
    [fileName, uri, accessToken, extraFormData, useBearerToken, propsOnClick],
  );

  return (
    <Button key="download" icon={<DownloadOutlined />} onClick={onClick} {...props}>
      {children === undefined ? "Download" : children}
    </Button>
  );
};

export default DownloadButton;
