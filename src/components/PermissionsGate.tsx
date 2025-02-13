import type { ReactNode } from "react";
import type { Resource } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";
import ForbiddenContent from "@/components/ForbiddenContent";

type PermissionsGateProps = {
  resource: Resource;
  children: ReactNode;
  requiredPermissions: string[];
  forbiddenMessage?: string;
};

const PermissionsGate = ({ resource, children, requiredPermissions, forbiddenMessage }: PermissionsGateProps) => {
  const rp = useResourcePermissionsWrapper(resource);
  const { permissions, hasAttemptedPermissions } = rp;

  if (hasAttemptedPermissions && !requiredPermissions.every((reqPerm) => permissions.includes(reqPerm))) {
    return <ForbiddenContent message={forbiddenMessage} debugState={rp} />;
  }

  return children;
};

export default PermissionsGate;
