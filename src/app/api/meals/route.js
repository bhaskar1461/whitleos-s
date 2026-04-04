import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createMealEntry, listMealsForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";
import { mealSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const meals = await listMealsForUser(user.id);

  return Response.json({ items: meals.map((entry) => serializeDocument(entry)) });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const body = await request.json().catch(() => null);
  const parsed = mealSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid meal payload.", 400, "validation_error");
  }

  const meal = await createMealEntry(user.id, {
    ...parsed.data,
    baseCalories: parsed.data.baseCalories ?? parsed.data.calories,
    quantity: parsed.data.quantity ?? 1,
    serving: parsed.data.serving ?? "1 serving",
  });

  return Response.json(
    { message: "Meal added.", item: serializeDocument(meal) },
    { status: 201 }
  );
}
