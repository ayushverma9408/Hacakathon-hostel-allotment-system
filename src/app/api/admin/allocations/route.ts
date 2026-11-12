import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { planAllocation } from "@/lib/allocation-engine";

const commitSchema = z.object({ sessionId: z.string().cuid() });

export async function GET(request: NextRequest) {
  const access = await requirePermission("allocations:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId || !z.string().cuid().safeParse(sessionId).success) return NextResponse.json({ error: "A valid sessionId is required." }, { status: 400 });
  const runs = await getPrisma().allocationRun.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true, status: true, algorithmVersion: true, startedAt: true, completedAt: true,
      createdBy: { select: { name: true } },
      _count: { select: { allocations: true, waitlistEntries: true } }
    }
  });
  return NextResponse.json({ runs });
}

export async function POST(request: NextRequest) {
  const access = await requirePermission("allocations:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Only administrators can commit allocation runs." }, { status: access.status });
  const parsed = commitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select a valid academic session." }, { status: 400 });

  try {
    const result = await getPrisma().$transaction(async (tx) => {
      const session = await tx.academicSession.findFirst({ where: { id: parsed.data.sessionId, status: "ACTIVE" }, select: { id: true, code: true, name: true } });
      if (!session) throw new Error("SESSION_NOT_ACTIVE");

      const existingRun = await tx.allocationRun.findFirst({ where: { sessionId: session.id, status: "COMPLETED" }, select: { id: true } });
      if (existingRun) throw new Error("ALLOCATION_ALREADY_COMPLETED");

      const [participants, rooms] = await Promise.all([
        tx.participant.findMany({
          where: { sessionId: session.id, status: "ACTIVE", allocations: { none: { sessionId: session.id } } },
          orderBy: [{ createdAt: "asc" }, { registrationNo: "asc" }],
          select: { id: true, registrationNo: true, fullName: true, createdAt: true }
        }),
        tx.room.findMany({
          where: { isActive: true, building: { hostel: { isActive: true } } },
          select: { id: true, code: true, capacity: true, building: { select: { code: true, name: true, hostel: { select: { code: true, name: true } } } } }
        })
      ]);
      if (participants.length === 0) throw new Error("NO_ACTIVE_PARTICIPANTS");

      const plan = planAllocation(
        participants.map((p) => ({ ...p, createdAt: p.createdAt })),
        rooms.map((room) => ({ id: room.id, code: room.code, capacity: room.capacity, buildingCode: room.building.code, buildingName: room.building.name, hostelCode: room.building.hostel.code, hostelName: room.building.hostel.name }))
      );

      const run = await tx.allocationRun.create({
        data: { sessionId: session.id, createdById: access.user.id, status: "DRAFT", algorithmVersion: plan.algorithmVersion }
      });
      if (plan.assignments.length) {
        await tx.allocation.createMany({
          data: plan.assignments.map((item) => ({ runId: run.id, sessionId: session.id, participantId: item.participantId, roomId: item.roomId, bedNumber: item.bedNumber, status: "CONFIRMED" }))
        });
      }
      if (plan.waitlist.length) {
        await tx.waitlistEntry.createMany({
          data: plan.waitlist.map((item) => ({ runId: run.id, participantId: item.participantId, position: item.position, reason: item.reason }))
        });
      }
      const completed = await tx.allocationRun.update({
        where: { id: run.id },
        data: { status: "COMPLETED", completedAt: new Date() },
        select: { id: true, status: true, algorithmVersion: true, completedAt: true }
      });
      await tx.auditEvent.create({
        data: {
          actorId: access.user.id,
          action: "ALLOCATION_RUN_COMPLETED",
          entityType: "AllocationRun",
          entityId: run.id,
          metadata: { sessionId: session.id, assigned: plan.statistics.assigned, waitlisted: plan.statistics.waitlisted, algorithmVersion: plan.algorithmVersion }
        }
      });
      return { run: completed, session, statistics: plan.statistics };
    }, { isolationLevel: "Serializable" });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SESSION_NOT_ACTIVE") return NextResponse.json({ error: "The selected academic session is not active." }, { status: 400 });
      if (error.message === "ALLOCATION_ALREADY_COMPLETED") return NextResponse.json({ error: "This session already has a completed allocation run. Reallocation is not enabled yet." }, { status: 409 });
      if (error.message === "NO_ACTIVE_PARTICIPANTS") return NextResponse.json({ error: "No unallocated active participants were found for this session." }, { status: 400 });
    }
    if (error && typeof error === "object" && "code" in error && (error.code === "P2002" || error.code === "P2034")) {
      return NextResponse.json({ error: "Another allocation request changed this session. Refresh and preview again." }, { status: 409 });
    }
    throw error;
  }
}
