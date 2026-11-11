import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before running the seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const session = await prisma.academicSession.upsert({
    where: { code: "DEMO-2026" },
    update: {},
    create: {
      code: "DEMO-2026",
      name: "Demo Academic Session 2026",
      startsAt: new Date("2026-07-01T00:00:00.000Z"),
      endsAt: new Date("2027-06-30T23:59:59.000Z"),
      status: "ACTIVE"
    }
  });

  const hostel = await prisma.hostel.upsert({
    where: { code: "DEMO-H1" },
    update: {},
    create: {
      code: "DEMO-H1",
      name: "Demo Hostel",
      description: "Synthetic development data only."
    }
  });

  const building = await prisma.building.upsert({
    where: { hostelId_code: { hostelId: hostel.id, code: "BLOCK-A" } },
    update: {},
    create: {
      hostelId: hostel.id,
      code: "BLOCK-A",
      name: "Demo Block A"
    }
  });

  await prisma.room.upsert({
    where: { buildingId_code: { buildingId: building.id, code: "A-101" } },
    update: {},
    create: {
      buildingId: building.id,
      code: "A-101",
      floor: 1,
      capacity: 2
    }
  });

  await prisma.user.upsert({
    where: { email: "demo-admin@example.test" },
    update: {},
    create: {
      email: "demo-admin@example.test",
      name: "Demo Administrator",
      role: "ADMIN"
    }
  });

  const demoParticipants = [
    {
      registrationNo: "DEMO-REG-001",
      fullName: "Sample Participant One"
    },
    {
      registrationNo: "DEMO-REG-002",
      fullName: "Sample Participant Two"
    }
  ];

  for (const participant of demoParticipants) {
    await prisma.participant.upsert({
      where: { registrationNo: participant.registrationNo },
      update: {},
      create: {
        ...participant,
        department: "Computer Science",
        academicYear: 2,
        sessionId: session.id
      }
    });
  }

  console.info("Synthetic hostel-allotment seed completed.");
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
