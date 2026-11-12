import "server-only";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";

export type { Permission } from "@/lib/permissions";

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

  if (!hasPermission(user.role, permission)) {
    return { ok: false as const, status: 403 as const };
  }

  return { ok: true as const, user };
}
