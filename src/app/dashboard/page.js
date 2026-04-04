import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard-view";
import { getSessionUser } from "@/lib/auth";

export const metadata = {
  title: "Dashboard",
  description: "Your Whiteloo member dashboard with access status and drink preferences.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardView user={user} />;
}
