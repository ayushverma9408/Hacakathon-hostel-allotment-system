import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

export async function GET() {
  const access = await requirePermission("users:read");

  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? "Authentication required." : "Insufficient permissions." },
      { status: access.status }
    );
  }

  const users = await getPrisma().user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return NextResponse.json({ users });
}
