import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { planAllocation } from "@/lib/allocation-engine";

const schema = z.object({ sessionId: z.string().cuid() });

export async function POST(request: NextRequest) {
  const access = await requirePermission("allocations:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select a valid academic session." }, { status: 400 });

  const prisma = getPrisma();
  const session = await prisma.academicSession.findFirst({ where: { id: parsed.data.sessionId, status: "ACTIVE" }, select: { id: true, code: true, name: true } });
  if (!session) return NextResponse.json({ error: "The selected academic session is not active." }, { status: 400 });

  const [participants, rooms, completedRun] = await Promise.all([
    prisma.participant.findMany({
      where: { sessionId: session.id, status: "ACTIVE", allocations: { none: { sessionId: session.id } } },
      orderBy: [{ createdAt: "asc" }, { registrationNo: "asc" }],
      select: { id: true, registrationNo: true, fullName: true, createdAt: true }
    }),
    prisma.room.findMany({
      where: { isActive: true, building: { hostel: { isActive: true } } },
      select: { id: true, code: true, capacity: true, building: { select: { code: true, name: true, hostel: { select: { code: true, name: true } } } } }
    }),
    prisma.allocationRun.findFirst({ where: { sessionId: session.id, status: "COMPLETED" }, select: { id: true, createdAt: true } })
  ]);

  if (completedRun) return NextResponse.json({ error: "This session already has a completed allocation run. Reallocation is not enabled yet.", completedRun }, { status: 409 });
  const plan = planAllocation(
    participants.map((p) => ({ ...p, createdAt: p.createdAt })),
    rooms.map((room) => ({ id: room.id, code: room.code, capacity: room.capacity, buildingCode: room.building.code, buildingName: room.building.name, hostelCode: room.building.hostel.code, hostelName: room.building.hostel.name }))
  );

  return NextResponse.json({
    session,
    algorithmVersion: plan.algorithmVersion,
    statistics: plan.statistics,
    assignments: plan.assignments,
    waitlist: plan.waitlist,
    note: "Preview only. No records have been written. Commit recalculates the plan on the server."
  });
}
