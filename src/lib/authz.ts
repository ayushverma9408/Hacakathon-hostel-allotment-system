import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
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

const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "users:read",
    "hostels:read",
    "hostels:manage",
    "participants:read",
    "participants:manage",
    "allocations:read",
    "allocations:manage",
    "reports:read",
    "reports:export",
    "audit:read"
  ],
  WARDEN: [
    "hostels:read",
    "hostels:manage",
    "participants:read",
    "participants:manage",
    "allocations:read",
    "reports:read",
    "reports:export"
  ],
  STAFF: [
    "hostels:read",
    "participants:read",
    "allocations:read",
    "reports:read"
  ]
};

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Re-read current role and active status rather than trusting stale JWT claims.
  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });

  if (!user?.isActive) return null;
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false as const, status: 401 as const };
  }

  if (!rolePermissions[user.role].includes(permission)) {
    return { ok: false as const, status: 403 as const };
  }

  return { ok: true as const, user };
}
