import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

const schema = z.object({ buildingId: z.string().cuid(), code: z.string().trim().min(1).max(24).regex(/^[A-Za-z0-9_-]+$/), floor: z.number().int().min(-2).max(100).default(0), capacity: z.number().int().min(1).max(20) });

export async function POST(request: NextRequest) {
  const access = await requirePermission("hostels:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid room details. Capacity must be between 1 and 20.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const room = await getPrisma().$transaction(async (tx) => {
      const created = await tx.room.create({ data: parsed.data });
      await tx.auditEvent.create({ data: { actorId: access.user.id, action: "ROOM_CREATED", entityType: "Room", entityId: created.id, metadata: { buildingId: created.buildingId, code: created.code, capacity: created.capacity } } });
      return created;
    });
    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "This room code already exists in the selected building." }, { status: 409 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") return NextResponse.json({ error: "Selected building does not exist." }, { status: 400 });
    throw error;
  }
}
