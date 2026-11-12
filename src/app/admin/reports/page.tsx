import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { getPrisma } from "@/lib/prisma";
import { ReportCenter } from "./report-center";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sessions = await getPrisma().academicSession.findMany({
    orderBy: { startsAt: "desc" },
    select: { id: true, code: true, name: true, status: true }
  });
  return <ReportCenter sessions={sessions} canExport={user.role !== "STAFF"} />;
}
