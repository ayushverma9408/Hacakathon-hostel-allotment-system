import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";

const schema = z.string().cuid();

export async function GET(request: NextRequest) {
  const access = await requirePermission("reports:read");
  if (!access.ok) return NextResponse.json({ error: access.status === 401 ? "Authentication required." : "Insufficient permissions." }, { status: access.status });

  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId || !schema.safeParse(sessionId).success) {
    return NextResponse.json({ error: "Select a valid academic session." }, { status: 400 });
  }

  const prisma = getPrisma();
  const session = await prisma.academicSession.findUnique({
    where: { id: sessionId },
    select: { id: true, code: true, name: true, status: true, startsAt: true, endsAt: true }
  });
  if (!session) return NextResponse.json({ error: "Academic session not found." }, { status: 404 });

  const [run, rooms] = await Promise.all([
    prisma.allocationRun.findFirst({
      where: { sessionId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: {
        id: true, algorithmVersion: true, completedAt: true,
        allocations: {
          where: { status: "CONFIRMED" },
          select: {
            participant: { select: { id: true } },
            room: { select: { id: true, code: true, capacity: true, building: { select: { code: true, name: true, hostel: { select: { code: true, name: true } } } } } }
          }
        },
        waitlistEntries: { select: { id: true } }
      }
    }),
    prisma.room.findMany({
      where: { isActive: true, building: { hostel: { isActive: true } } },
      select: { id: true, code: true, capacity: true, building: { select: { code: true, name: true, hostel: { select: { code: true, name: true } } } } }
    })
  ]);

  const occupancy = new Map<string, number>();
  for (const item of run?.allocations ?? []) occupancy.set(item.room.id, (occupancy.get(item.room.id) ?? 0) + 1);

  const hostelMap = new Map<string, {
    code: string; name: string; capacity: number; occupied: number;
    buildings: Map<string, { code: string; name: string; rooms: Array<{ roomCode: string; capacity: number; occupied: number }> }>;
  }>();

  for (const room of rooms) {
    const hostel = room.building.hostel;
    const buildingKey = `${hostel.code}/${room.building.code}`;
    let item = hostelMap.get(hostel.code);
    if (!item) {
      item = { code: hostel.code, name: hostel.name, capacity: 0, occupied: 0, buildings: new Map() };
      hostelMap.set(hostel.code, item);
    }
    let building = item.buildings.get(buildingKey);
    if (!building) {
      building = { code: room.building.code, name: room.building.name, rooms: [] };
      item.buildings.set(buildingKey, building);
    }
    const occupied = occupancy.get(room.id) ?? 0;
    item.capacity += room.capacity;
    item.occupied += occupied;
    building.rooms.push({ roomCode: room.code, capacity: room.capacity, occupied });
  }

  const hostels = [...hostelMap.values()].sort((a, b) => a.code.localeCompare(b.code)).map((hostel) => ({
    code: hostel.code,
    name: hostel.name,
    capacity: hostel.capacity,
    occupied: hostel.occupied,
    vacant: Math.max(0, hostel.capacity - hostel.occupied),
    occupancyPercent: hostel.capacity ? Math.round((hostel.occupied / hostel.capacity) * 1000) / 10 : 0,
    buildings: [...hostel.buildings.values()].sort((a, b) => a.code.localeCompare(b.code)).map((building) => ({
      code: building.code,
      name: building.name,
      rooms: building.rooms.sort((a, b) => a.roomCode.localeCompare(b.roomCode)).map((room) => ({
        ...room,
        vacant: Math.max(0, room.capacity - room.occupied),
        occupancyPercent: room.capacity ? Math.round((room.occupied / room.capacity) * 1000) / 10 : 0
      }))
    }))
  }));

  const assigned = run?.allocations.length ?? 0;
  const waitlisted = run?.waitlistEntries.length ?? 0;
  const capacity = hostels.reduce((sum, hostel) => sum + hostel.capacity, 0);
  return NextResponse.json({
    session,
    run: run ? { id: run.id, algorithmVersion: run.algorithmVersion, completedAt: run.completedAt } : null,
    summary: {
      assigned, waitlisted, bedCapacity: capacity,
      vacantBeds: Math.max(0, capacity - assigned),
      occupancyPercent: capacity ? Math.round((assigned / capacity) * 1000) / 10 : 0
    },
    hostels
  });
}
