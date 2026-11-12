import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { AuditExplorer } from "./audit-explorer";

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");
  return <AuditExplorer />;
}
