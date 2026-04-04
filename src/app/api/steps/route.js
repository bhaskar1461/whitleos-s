import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createStepEntry, listStepsForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";
import { stepSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const steps = await listStepsForUser(user.id);

  return Response.json({ items: steps.map((entry) => serializeDocument(entry)) });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const body = await request.json().catch(() => null);
  const parsed = stepSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid steps payload.", 400, "validation_error");
  }

  const step = await createStepEntry(user.id, {
    ...parsed.data,
    source: parsed.data.source || "manual",
  });

  return Response.json(
    { message: "Steps added.", item: serializeDocument(step) },
    { status: 201 }
  );
}
