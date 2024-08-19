import React from "react";

import { useAutoAuthenticate } from "bento-auth-js";
import SitePageLoading from "./SitePageLoading";
import { useOpenIDConfigNotLoaded } from "@/hooks";

const AutoAuthenticate = ({ children }: { children: React.ReactNode }) => {
  const { isAutoAuthenticating } = useAutoAuthenticate();
  const openIdConfigNotLoaded = useOpenIDConfigNotLoaded();

  if (openIdConfigNotLoaded || isAutoAuthenticating) {
    return <SitePageLoading />;
  }

  return children;
};

export default AutoAuthenticate;
