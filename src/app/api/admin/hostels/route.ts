import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

const hostelSchema = z.object({
  code: z.string().trim().min(2).max(24).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().nullable()
});

export async function GET() {
  const access = await requirePermission("hostels:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const hostels = await getPrisma().hostel.findMany({
    where: { isActive: true }, orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, description: true,
      buildings: { orderBy: { name: "asc" }, select: { id: true, code: true, name: true,
        rooms: { orderBy: { code: "asc" }, select: { id: true, code: true, floor: true, capacity: true, isActive: true } }
      } }
    }
  });
  return NextResponse.json({ hostels });
}

export async function POST(request: NextRequest) {
  const access = await requirePermission("hostels:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const parsed = hostelSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid hostel details.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const hostel = await getPrisma().$transaction(async (tx) => {
      const created = await tx.hostel.create({ data: { ...parsed.data, description: parsed.data.description || null } });
      await tx.auditEvent.create({ data: { actorId: access.user.id, action: "HOSTEL_CREATED", entityType: "Hostel", entityId: created.id, metadata: { code: created.code } } });
      return created;
    });
    return NextResponse.json({ hostel }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "A hostel with this code already exists." }, { status: 409 });
    throw error;
  }
}
