import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

export async function GET() {
  const access = await requirePermission("participants:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const sessions = await getPrisma().academicSession.findMany({ where: { status: "ACTIVE" }, orderBy: { startsAt: "desc" }, select: { id: true, code: true, name: true, startsAt: true, endsAt: true } });
  return NextResponse.json({ sessions });
}
