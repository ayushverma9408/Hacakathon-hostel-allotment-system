import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const timestamp = new Date().toISOString();

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      status: "ok",
      service: "allotmentpro-web",
      database: "not_configured",
      phase: "database-foundation",
      timestamp
    });
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "allotmentpro-web",
      database: "connected",
      phase: "database-foundation",
      timestamp
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "allotmentpro-web",
        database: "unavailable",
        phase: "database-foundation",
        timestamp
      },
      { status: 503 }
    );
  }
}
