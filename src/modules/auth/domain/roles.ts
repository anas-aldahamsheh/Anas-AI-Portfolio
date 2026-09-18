export type Role = "GUEST" | "USER" | "ADMIN";
export type UserRole = Role;

export const ROLES: Record<Role, Role> = {
  GUEST: "GUEST",
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const ROLE_HIERARCHY: Record<Role, number> = {
  GUEST: 0,
  USER: 1,
  ADMIN: 2,
};

/**
 * Checks if a given role meets or exceeds the required role in hierarchy.
 */
export function hasRole(actualRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[actualRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

export function isGuest(role?: Role | null): boolean {
  return !role || role === "GUEST";
}

export function isUser(role?: Role | null): boolean {
  return role === "USER" || role === "ADMIN";
}

export function isAdmin(role?: Role | null): boolean {
  return role === "ADMIN";
}
