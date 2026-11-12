import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { toCsv } from "@/lib/report-csv";

const idSchema = z.string().cuid();
const typeSchema = z.enum(["allocations", "waitlist"]);

export async function GET(request: NextRequest) {
  const access = await requirePermission("reports:export");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Only administrators and wardens can export participant-level reports." }, { status: access.status });

  const params = request.nextUrl.searchParams;
  const sessionId = params.get("sessionId");
  const type = typeSchema.safeParse(params.get("type"));
  if (!sessionId || !idSchema.safeParse(sessionId).success || !type.success) {
    return NextResponse.json({ error: "A valid sessionId and export type are required." }, { status: 400 });
  }

  const prisma = getPrisma();
  const session = await prisma.academicSession.findUnique({ where: { id: sessionId }, select: { code: true } });
  if (!session) return NextResponse.json({ error: "Academic session not found." }, { status: 404 });

  const run = await prisma.allocationRun.findFirst({
    where: { sessionId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      allocations: {
        where: { status: "CONFIRMED" },
        orderBy: [{ room: { building: { hostel: { code: "asc" } } } }, { room: { building: { code: "asc" } } }, { room: { code: "asc" } }, { bedNumber: "asc" }],
        select: {
          participant: { select: { registrationNo: true, fullName: true, department: true, academicYear: true } },
          room: { select: { code: true, building: { select: { code: true, name: true, hostel: { select: { code: true, name: true } } } } } },
          bedNumber: true
        }
      },
      waitlistEntries: {
        orderBy: { position: "asc" },
        select: { position: true, reason: true, participant: { select: { registrationNo: true, fullName: true, department: true, academicYear: true } } }
      }
    }
  });

  if (!run) return NextResponse.json({ error: "No completed allocation run exists for this session." }, { status: 404 });

  const rows: unknown[][] = type.data === "allocations"
    ? [
        ["Registration number", "Participant name", "Department", "Academic year", "Hostel", "Building", "Room", "Bed"],
        ...run.allocations.map((item) => [
          item.participant.registrationNo, item.participant.fullName, item.participant.department ?? "",
          item.participant.academicYear ?? "", item.room.building.hostel.name, item.room.building.name,
          item.room.code, item.bedNumber
        ])
      ]
    : [
        ["Waitlist position", "Registration number", "Participant name", "Department", "Academic year", "Reason"],
        ...run.waitlistEntries.map((item) => [
          item.position, item.participant.registrationNo, item.participant.fullName, item.participant.department ?? "",
          item.participant.academicYear ?? "", item.reason
        ])
      ];

  const csv = toCsv(rows);
  const filename = `${session.code.replace(/[^A-Za-z0-9_-]/g, "_")}-${type.data}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
