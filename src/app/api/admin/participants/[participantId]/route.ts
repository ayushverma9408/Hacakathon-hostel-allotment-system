import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

type Context = { params: Promise<{ participantId: string }> };
const schema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.union([z.string().trim().email().max(254), z.literal("")]).nullable().optional(),
  department: z.string().trim().max(100).nullable().optional(),
  academicYear: z.number().int().min(1).max(10).nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
}).refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: NextRequest, context: Context) {
  const access = await requirePermission("participants:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const { participantId } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid participant update.", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const participant = await getPrisma().$transaction(async (tx) => {
      const updated = await tx.participant.update({ where: { id: participantId }, data: { ...parsed.data, email: parsed.data.email === "" ? null : parsed.data.email?.toLowerCase() } });
      await tx.auditEvent.create({ data: { actorId: access.user.id, action: "PARTICIPANT_UPDATED", entityType: "Participant", entityId: updated.id, metadata: { fields: Object.keys(parsed.data) } } });
      return updated;
    });
    return NextResponse.json({ participant });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    throw error;
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  const access = await requirePermission("participants:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const { participantId } = await context.params;
  try {
    const participant = await getPrisma().$transaction(async (tx) => {
      const updated = await tx.participant.update({ where: { id: participantId }, data: { status: "INACTIVE" } });
      await tx.auditEvent.create({ data: { actorId: access.user.id, action: "PARTICIPANT_DEACTIVATED", entityType: "Participant", entityId: updated.id, metadata: { registrationNo: updated.registrationNo } } });
      return updated;
    });
    return NextResponse.json({ participant });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    throw error;
  }
}
