import { useEffect, useState } from "react";
import { RESOURCE_EVERYTHING, useAuthorizationHeader, viewDropBox } from "bento-auth-js";
import { useHasResourcePermissionWrapper } from "@/hooks";
import { useService } from "@/modules/services/hooks";
import { type RootState, useAppDispatch, useAppSelector } from "@/store";
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

export const useDropBoxFileContent = (filePath?: string): Blob | null => {
  const file = useAppSelector((state: RootState) =>
    state.dropBox.tree.find((f: { filePath: string | undefined }) => f?.filePath === filePath),
  );
  const authHeader = useAuthorizationHeader();

  const [fileContents, setFileContents] = useState<Blob | null>(null);

  const fileExt = filePath?.split(".").slice(-1)[0].toLowerCase();

  // fetch effect
  useEffect(() => {
    setFileContents(null);
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
          const content = await r.blob();
          setFileContents(content);
        } else {
          console.error(`Could not load file: ${r.body}`);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [file, fileExt, authHeader]);

  return fileContents;
};
