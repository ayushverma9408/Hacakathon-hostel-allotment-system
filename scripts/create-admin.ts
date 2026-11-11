import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const {
  DATABASE_URL,
  BOOTSTRAP_ADMIN_EMAIL,
  BOOTSTRAP_ADMIN_NAME,
  BOOTSTRAP_ADMIN_PASSWORD
} = process.env;

async function main() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const email = BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const name = BOOTSTRAP_ADMIN_NAME?.trim();
  const password = BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set a valid BOOTSTRAP_ADMIN_EMAIL in your local environment.");
  }
  if (!name || name.length < 2 || name.length > 120) {
    throw new Error("BOOTSTRAP_ADMIN_NAME must contain 2–120 characters.");
  }
  if (!password || password.length < 14 || password.length > 128) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain 14–128 characters.");
  }

  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: "ADMIN",
        passwordHash,
        isActive: true
      },
      create: {
        email,
        name,
        role: "ADMIN",
        passwordHash
      }
    });

    console.info("Administrator account created or updated.");
    console.info("Remove the BOOTSTRAP_ADMIN_* values from your local environment.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Administrator bootstrap failed:", error);
  process.exitCode = 1;
});
