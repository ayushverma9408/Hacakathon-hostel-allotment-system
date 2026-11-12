import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { ParticipantManager } from "./participant-manager";

export default async function ParticipantsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <ParticipantManager canManage={user.role !== "STAFF"} />;
}
