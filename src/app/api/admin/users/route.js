import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { listUsers } from "@/lib/store";
import { serializeUser } from "@/lib/utils";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return jsonError("Authentication required.", 401, "unauthorized");
  }

  if (user.role !== "admin") {
    return jsonError("Admin access required.", 403, "forbidden");
  }

  const users = await listUsers();

  return Response.json({
    users: users.map((entry) => serializeUser(entry)),
  });
}
