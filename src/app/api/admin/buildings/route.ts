import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

const schema = z.object({ hostelId: z.string().cuid(), code: z.string().trim().min(1).max(24).regex(/^[A-Za-z0-9_-]+$/), name: z.string().trim().min(1).max(100) });

export async function POST(request: NextRequest) {
  const access = await requirePermission("hostels:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid building details.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const building = await getPrisma().$transaction(async (tx) => {
      const created = await tx.building.create({ data: parsed.data });
      await tx.auditEvent.create({ data: { actorId: access.user.id, action: "BUILDING_CREATED", entityType: "Building", entityId: created.id, metadata: { hostelId: created.hostelId, code: created.code } } });
      return created;
    });
    return NextResponse.json({ building }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "This building code already exists in the selected hostel." }, { status: 409 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") return NextResponse.json({ error: "Selected hostel does not exist." }, { status: 400 });
    throw error;
  }
}
