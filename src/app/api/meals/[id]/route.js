import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { deleteMealEntry } from "@/lib/store";

export async function DELETE(_request, { params }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const deleted = await deleteMealEntry(user.id, params.id);
  if (!deleted) return jsonError("Meal entry not found.", 404, "not_found");

  return Response.json({ message: "Meal deleted." });
}
