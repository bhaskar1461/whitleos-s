import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createWorkoutEntry, listWorkoutsForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";
import { workoutSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const workouts = await listWorkoutsForUser(user.id);

  return Response.json({ items: workouts.map((entry) => serializeDocument(entry)) });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const body = await request.json().catch(() => null);
  const parsed = workoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid workout payload.", 400, "validation_error");
  }

  const workout = await createWorkoutEntry(user.id, {
    ...parsed.data,
    source: parsed.data.source || "manual",
  });

  return Response.json(
    { message: "Workout added.", item: serializeDocument(workout) },
    { status: 201 }
  );
}
