import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { AllocationManager } from "./allocation-manager";

export default async function AllocationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AllocationManager canCommit={user.role === "ADMIN"} />;
}
