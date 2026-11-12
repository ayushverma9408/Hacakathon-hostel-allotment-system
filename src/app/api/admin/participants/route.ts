import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

const schema = z.object({
  registrationNo: z.string().trim().min(2).max(40),
  fullName: z.string().trim().min(2).max(120),
  email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  department: z.string().trim().max(100).optional(),
  academicYear: z.number().int().min(1).max(10).optional(),
  sessionId: z.string().cuid()
});

export async function GET(request: NextRequest) {
  const access = await requirePermission("participants:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 25));
  const q = (params.get("q") || "").trim().slice(0, 120);
  const sessionId = params.get("sessionId") || undefined;
  const where = {
    ...(sessionId ? { sessionId } : {}),
    ...(q ? { OR: [
      { registrationNo: { contains: q, mode: "insensitive" as const } },
      { fullName: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } }
    ] } : {})
  };
  const prisma = getPrisma();
  const [participants, total] = await prisma.$transaction([
    prisma.participant.findMany({ where, orderBy: [{ fullName: "asc" }, { registrationNo: "asc" }], skip: (page - 1) * limit, take: limit, select: { id: true, registrationNo: true, fullName: true, email: true, department: true, academicYear: true, status: true, sessionId: true, session: { select: { code: true, name: true } } } }),
    prisma.participant.count({ where })
  ]);
  return NextResponse.json({ participants, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(request: NextRequest) {
  const access = await requirePermission("participants:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid participant details.", issues: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const session = await getPrisma().academicSession.findFirst({ where: { id: data.sessionId, status: "ACTIVE" }, select: { id: true } });
  if (!session) return NextResponse.json({ error: "Select an active academic session." }, { status: 400 });
  try {
    const participant = await getPrisma().$transaction(async (tx) => {
      const created = await tx.participant.create({ data: { registrationNo: data.registrationNo, fullName: data.fullName, email: data.email?.toLowerCase() || null, department: data.department || null, academicYear: data.academicYear, sessionId: data.sessionId } });
      await tx.auditEvent.create({ data: { actorId: access.user.id, action: "PARTICIPANT_CREATED", entityType: "Participant", entityId: created.id, metadata: { registrationNo: created.registrationNo, sessionId: created.sessionId } } });
      return created;
    });
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That registration number is already registered." }, { status: 409 });
    throw error;
  }
}
