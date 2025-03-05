import type { ReactNode } from "react";
import type { Resource } from "bento-auth-js";
import { useResourcePermissionsWrapper } from "@/hooks";
import ForbiddenContent from "@/components/ForbiddenContent";

export type ResourcePermissionsCheck = {
  resource: Resource;
  requiredPermissions: string[];
};

type BasePermissionsGateProps = {
  children: ReactNode;
  forbiddenMessage?: string;
};

type ResourcePermissionsGateProps = BasePermissionsGateProps & ResourcePermissionsCheck;
type PermissionsGateProps = BasePermissionsGateProps & {
  check: ResourcePermissionsCheck | { hasPermissions: boolean; debugState?: object };
};

const ResourcePermissionsGate = ({
  resource,
  requiredPermissions,
  children,
  forbiddenMessage,
}: ResourcePermissionsGateProps) => {
  const rp = useResourcePermissionsWrapper(resource);
  const { permissions, hasAttemptedPermissions } = rp;

  if (hasAttemptedPermissions && !requiredPermissions.every((reqPerm) => permissions.includes(reqPerm))) {
    return <ForbiddenContent message={forbiddenMessage} debugState={rp} />;
  }

  return children;
};

const PermissionsGate = ({ check, children, forbiddenMessage }: PermissionsGateProps) => {
  if ("resource" in check) {
    return (
      <ResourcePermissionsGate
        resource={check.resource}
        requiredPermissions={check.requiredPermissions}
        forbiddenMessage={forbiddenMessage}
      >
        {children}
      </ResourcePermissionsGate>
    );
  } else {
    return check.hasPermissions ? children : <ForbiddenContent message={forbiddenMessage} debugState={check} />;
  }
};

export default PermissionsGate;
