import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const accounts = [
  { email: "e2e-warden@example.test", name: "E2E Warden", role: "WARDEN" as const },
  { email: "e2e-staff@example.test", name: "E2E Staff", role: "STAFF" as const }
];

async function main() {
  const passwordHash = await hash("E2E-Test-Password-2026!", 10);
  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role, passwordHash, isActive: true },
      create: { ...account, passwordHash }
    });
  }
  console.info("Synthetic E2E role accounts prepared.");
}

main()
  .catch((error: unknown) => {
    console.error("E2E account setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
