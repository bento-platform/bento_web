import { useEffect, useMemo, useState } from "react";
import { RESOURCE_EVERYTHING, useAuthorizationHeader, viewDropBox } from "bento-auth-js";

import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { type RootState, useAppDispatch, useAppSelector } from "@/store";
import type { JSONType } from "@/types/json";

import { fetchDropBoxTree } from "./actions";

export const useDropBox = () => {
  const dispatch = useAppDispatch();

  const dropBox = useService("drop-box"); // TODO: associate this with the network action somehow
  const { hasPermission } = useHasResourcePermissionWrapper(RESOURCE_EVERYTHING, viewDropBox);

  useEffect(() => {
    // If hasPermission changes to true, this will automatically dispatch the drop box tree fetch method.
    if (hasPermission) {
      dispatch(fetchDropBoxTree()).catch((err) => console.error(err));
    }
  }, [dispatch, dropBox, hasPermission]);

  return useAppSelector((state) => state.dropBox);
};

/**
 * Given the path of a dropbox file, will attempt to retrieve the blob using the file's URI.
 */
const useDropBoxFileBlob = (filePath?: string): Blob | null => {
  const file = useAppSelector((state: RootState) =>
    state.dropBox.tree.find((f: { filePath: string | undefined }) => f?.filePath === filePath),
  );
  const authHeader = useAuthorizationHeader();

  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  const fileExt = filePath?.split(".").slice(-1)[0].toLowerCase();

  // fetch effect
  useEffect(() => {
    setFileBlob(null);
    (async () => {
      if (!file || !fileExt) return;
      if (!file?.uri) {
        console.error(`Files: something went wrong while trying to load ${file?.name}`);
        return;
      }
      if (fileExt === "pdf") {
        console.error("Cannot retrieve PDF with useDropBoxFileContent");
        return;
      }

      try {
        const r = await fetch(file.uri, { headers: authHeader });
        if (r.ok) {
          const blob = await r.blob();
          setFileBlob(blob);
        } else {
          console.error(`Could not load file: ${r.body}`);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [file, fileExt, authHeader]);

  return fileBlob;
};

/**
 * Given a dropbox filepath, will retrieve the blob and return its raw text.
 */
const useDropBoxFileText = (filePath?: string): string | null => {
  const fileContentBlob = useDropBoxFileBlob(filePath);
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      if (fileContentBlob) {
        setText(await fileContentBlob.text());
      } else {
        setText(null);
      }
    })();
  }, [fileContentBlob]);
  return text;
};

/**
 * Given a dropbox file path, will return the file's content parsed as JSON data.
 * Meant to be used in forms with file tree select to read the content of the selected file for a field.
 * When filePath is undefined, the defaultValue is returned instead, allowing to pass the field's initial value.
 * @param filePath path to a dropbox file, undefined when used in a form with no selected file.
 * @param defaultValue default value to return when there is no selected file.
 * @returns the dropbox file data in JSON if it can be parsed, null if no text in the file, otherwise defaultValue.
 */
export const useDropBoxJsonContent = (filePath?: string, defaultValue: JSONType = null): JSONType => {
  const rawText = useDropBoxFileText(filePath);
  return useMemo(() => {
    if (!filePath) {
      // no file selected
      return defaultValue;
    }
    // parsed file content, or null if empty
    return rawText ? JSON.parse(rawText) : null;
  }, [filePath, rawText, defaultValue]);
};
