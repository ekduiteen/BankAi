import { hasPermission, hasAnyPermission, hasMinRole, getCurrentUserRole } from '../../config/rolePermissions';

export default function PermissionGate({ permission, anyOf, minRole, role, fallback = null, children }) {
  const userRole = getCurrentUserRole();

  let allowed = true;

  if (permission) allowed = allowed && hasPermission(userRole, permission);
  if (anyOf) allowed = allowed && hasAnyPermission(userRole, anyOf);
  if (minRole) allowed = allowed && hasMinRole(userRole, minRole);
  if (role) allowed = allowed && userRole === role;

  return allowed ? children : fallback;
}
