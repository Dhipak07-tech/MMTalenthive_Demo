import React from 'react';
import { useAppSelector } from '../../app/hooks';

export const ROLE_PRIORITIES: Record<string, number> = {
  ROLE_ULTRA_SUPER_ADMIN: 100,
  ROLE_SUPER_ADMIN: 80,
  ROLE_ADMIN: 60,
  ROLE_EMPLOYEE: 20,
};

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowedRoles?: string[];
  minRole?: string;
  requiredPermission?: string; // Optional permission check
}

export function RoleGuard({
  children,
  fallback = null,
  allowedRoles,
  minRole,
}: RoleGuardProps) {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // 1. Allowed roles check
  if (allowedRoles && allowedRoles.length > 0) {
    if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // 2. Minimum role priority check
  if (minRole) {
    const userPriority = ROLE_PRIORITIES[user.role] || 0;
    const requiredPriority = ROLE_PRIORITIES[minRole] || 0;

    if (userPriority >= requiredPriority) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
