import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { HostelManager } from "./hostel-manager";

export default async function HostelsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <HostelManager canManage={user.role !== "STAFF"} />;
}
