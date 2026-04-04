import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { listLocations, listUsers, listWaitlist } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return jsonError("Authentication required.", 401, "unauthorized");
  }

  if (user.role !== "admin") {
    return jsonError("Admin access required.", 403, "forbidden");
  }

  const [users, waitlist, locations] = await Promise.all([
    listUsers(),
    listWaitlist(),
    listLocations(),
  ]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((entry) => entry.role === "admin").length;
  const waitlistCount = waitlist.length;
  const totalLocations = locations.length;
  const liveLocations = locations.filter((entry) => entry.status === "live").length;
  const comingSoonLocations = locations.filter(
    (entry) => entry.status === "coming soon"
  ).length;

  return Response.json({
    totalUsers,
    totalAdmins,
    waitlistCount,
    totalLocations,
    liveLocations,
    comingSoonLocations,
  });
}
