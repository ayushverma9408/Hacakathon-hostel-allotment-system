import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

const dateSchema = z.string().datetime({ offset: true });

export async function GET(request: NextRequest) {
  const access = await requirePermission("audit:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Only administrators can view the audit trail." }, { status: access.status });

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Math.min(10000, Number(params.get("page")) || 1));
  const limit = Math.max(1, Math.min(100, Number(params.get("limit")) || 25));
  const action = (params.get("action") || "").trim().slice(0, 80);
  const entityType = (params.get("entityType") || "").trim().slice(0, 80);
  const actorId = (params.get("actorId") || "").trim().slice(0, 30);
  const from = params.get("from");
  const to = params.get("to");

  if (from && !dateSchema.safeParse(from).success) return NextResponse.json({ error: "Invalid start date." }, { status: 400 });
  if (to && !dateSchema.safeParse(to).success) return NextResponse.json({ error: "Invalid end date." }, { status: 400 });
  if (from && to && new Date(from) > new Date(to)) return NextResponse.json({ error: "Start date must be before end date." }, { status: 400 });

  const where = {
    ...(action ? { action: { contains: action, mode: "insensitive" as const } } : {}),
    ...(entityType ? { entityType: { contains: entityType, mode: "insensitive" as const } } : {}),
    ...(actorId ? { actorId } : {}),
    ...((from || to) ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {})
  };

  const prisma = getPrisma();
  const [events, total, actors] = await prisma.$transaction([
    prisma.auditEvent.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, action: true, entityType: true, entityId: true, metadata: true, createdAt: true,
        actor: { select: { id: true, name: true, email: true, role: true } }
      }
    }),
    prisma.auditEvent.count({ where }),
    prisma.user.findMany({ where: { auditEvents: { some: {} } }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true } })
  ]);

  return NextResponse.json({ events, actors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }, { headers: { "Cache-Control": "private, no-store" } });
}
