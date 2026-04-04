import { redirect } from "next/navigation";

import { AdminView } from "@/components/admin-view";
import { getSessionUser } from "@/lib/auth";
import { listLocations, listUsers, listWaitlist } from "@/lib/store";
import { serializeDocument, serializeUser } from "@/lib/utils";

export const metadata = {
  title: "Admin",
  description: "Whiteloo admin panel for users, waitlist, locations, and launch analytics.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const [users, waitlist, locations] = await Promise.all([
    listUsers(),
    listWaitlist(),
    listLocations(),
  ]);

  const serializedUsers = users.map((entry) => serializeUser(entry));
  const serializedWaitlist = waitlist.map((entry) => serializeDocument(entry));
  const serializedLocations = locations.map((entry) => serializeDocument(entry));

  const analytics = {
    totalUsers: serializedUsers.length,
    totalAdmins: serializedUsers.filter((entry) => entry.role === "admin").length,
    waitlistCount: serializedWaitlist.length,
    totalLocations: serializedLocations.length,
    liveLocations: serializedLocations.filter((entry) => entry.status === "live").length,
    comingSoonLocations: serializedLocations.filter((entry) => entry.status === "coming soon").length,
  };

  return (
    <AdminView
      user={user}
      initialUsers={serializedUsers}
      initialWaitlist={serializedWaitlist}
      initialLocations={serializedLocations}
      analytics={analytics}
    />
  );
}
