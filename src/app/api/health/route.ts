import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "allotmentpro-web",
    phase: "application-foundation",
    timestamp: new Date().toISOString()
  });
}
