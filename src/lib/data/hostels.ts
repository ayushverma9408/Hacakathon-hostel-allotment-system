import { getPrisma } from "@/lib/prisma";

export async function listActiveHostels() {
  return getPrisma().hostel.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      _count: {
        select: { buildings: true }
      }
    }
  });
}
