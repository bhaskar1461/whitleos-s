import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { listWaitlist } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return jsonError("Authentication required.", 401, "unauthorized");
  }

  if (user.role !== "admin") {
    return jsonError("Admin access required.", 403, "forbidden");
  }

  const waitlist = await listWaitlist();

  return Response.json({
    waitlist: waitlist.map((entry) => serializeDocument(entry)),
  });
}
