import type { UserRole } from "@/generated/prisma/client";

export type Permission =
  | "users:read"
  | "hostels:read"
  | "hostels:manage"
  | "participants:read"
  | "participants:manage"
  | "allocations:read"
  | "allocations:manage"
  | "reports:read"
  | "reports:export"
  | "audit:read";

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  ADMIN: [
    "users:read", "hostels:read", "hostels:manage",
    "participants:read", "participants:manage",
    "allocations:read", "allocations:manage",
    "reports:read", "reports:export", "audit:read"
  ],
  WARDEN: [
    "hostels:read", "hostels:manage",
    "participants:read", "participants:manage",
    "allocations:read", "reports:read", "reports:export"
  ],
  STAFF: [
    "hostels:read", "participants:read",
    "allocations:read", "reports:read"
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}
