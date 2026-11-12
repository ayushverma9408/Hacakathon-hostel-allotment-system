import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { parseCsv } from "@/lib/csv";

const rowSchema = z.object({
  registrationNo: z.string().trim().min(2).max(40),
  fullName: z.string().trim().min(2).max(120),
  email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  department: z.string().trim().max(100).optional(),
  academicYear: z.string().optional()
});

export async function POST(request: NextRequest) {
  const access = await requirePermission("participants:manage");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });
  const body = await request.json().catch(() => null) as { sessionId?: unknown; csv?: unknown } | null;
  const requestSchema = z.object({ sessionId: z.string().cuid(), csv: z.string().min(1).max(2_000_000) });
  const parsedRequest = requestSchema.safeParse(body);
  if (!parsedRequest.success) return NextResponse.json({ error: "Provide an active session and a CSV file under 2 MB." }, { status: 400 });
  const session = await getPrisma().academicSession.findFirst({ where: { id: parsedRequest.data.sessionId, status: "ACTIVE" }, select: { id: true } });
  if (!session) return NextResponse.json({ error: "Select an active academic session." }, { status: 400 });

  let rows: string[][];
  try { rows = parseCsv(parsedRequest.data.csv); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid CSV." }, { status: 400 }); }
  if (rows.length < 2) return NextResponse.json({ error: "CSV must contain a header and at least one participant." }, { status: 400 });
  const headers = rows[0].map((value) => value.toLowerCase().replace(/\s+/g, ""));
  const required = ["registrationno", "fullname"];
  if (required.some((key) => !headers.includes(key))) return NextResponse.json({ error: "CSV headers must include registrationNo and fullName. Optional: email, department, academicYear." }, { status: 400 });
  const index = (key: string) => headers.indexOf(key);
  const valid: Array<{ registrationNo: string; fullName: string; email: string | null; department: string | null; academicYear: number | null; sessionId: string }> = [];
  const invalidRows: Array<{ row: number; reason: string }> = [];
  const seen = new Set<string>();

  rows.slice(1).forEach((cells, offset) => {
    const raw = {
      registrationNo: cells[index("registrationno")] || "",
      fullName: cells[index("fullname")] || "",
      email: index("email") >= 0 ? cells[index("email")] || "" : "",
      department: index("department") >= 0 ? cells[index("department")] || "" : "",
      academicYear: index("academicyear") >= 0 ? cells[index("academicyear")] || "" : ""
    };
    const parsed = rowSchema.safeParse(raw);
    const year = raw.academicYear ? Number(raw.academicYear) : null;
    if (!parsed.success || (year !== null && (!Number.isInteger(year) || year < 1 || year > 10))) {
      invalidRows.push({ row: offset + 2, reason: "Invalid required field, email, or academic year." }); return;
    }
    const key = parsed.data.registrationNo.toLowerCase();
    if (seen.has(key)) { invalidRows.push({ row: offset + 2, reason: "Duplicate registration number within this CSV." }); return; }
    seen.add(key);
    valid.push({ registrationNo: parsed.data.registrationNo, fullName: parsed.data.fullName, email: parsed.data.email?.toLowerCase() || null, department: parsed.data.department || null, academicYear: year, sessionId: session.id });
  });

  if (valid.length === 0) return NextResponse.json({ inserted: 0, skipped: invalidRows.length, invalidRows, message: "No valid rows to import." });
  const result = await getPrisma().$transaction(async (tx) => {
    const created = await tx.participant.createMany({ data: valid, skipDuplicates: true });
    await tx.auditEvent.create({ data: { actorId: access.user.id, action: "PARTICIPANTS_IMPORTED", entityType: "AcademicSession", entityId: session.id, metadata: { attempted: valid.length, inserted: created.count, invalid: invalidRows.length } } });
    return created;
  });
  return NextResponse.json({ inserted: result.count, skipped: invalidRows.length + valid.length - result.count, invalidRows, duplicateDatabaseRows: valid.length - result.count });
}
