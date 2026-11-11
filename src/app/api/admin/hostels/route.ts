import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

export async function GET() {
  const access = await requirePermission("hostels:read");

  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? "Authentication required." : "Insufficient permissions." },
      { status: access.status }
    );
  }

  const hostels = await getPrisma().hostel.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true
    }
  });

  return NextResponse.json({ hostels });
}
