import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { updateUserPreferences } from "@/lib/store";
import { preferencesSchema } from "@/lib/validation";
import { serializeUser } from "@/lib/utils";

export async function PUT(request) {
  const user = await getSessionUser();

  if (!user) {
    return jsonError("Authentication required.", 401, "unauthorized");
  }

  const body = await request.json().catch(() => null);
  const parsed = preferencesSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid preferences payload.", 400, "validation_error");
  }

  const updatedUser = await updateUserPreferences(user.id, parsed.data);

  if (!updatedUser) {
    return jsonError("User record was not found.", 404, "user_not_found");
  }

  return Response.json({
    message: "Preferences updated.",
    user: serializeUser(updatedUser),
  });
}
