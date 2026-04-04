import { redirect } from "next/navigation";

import { MealPlanView } from "@/components/meal-plan-view";
import { getSessionUser } from "@/lib/auth";
import { listMealsForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";

export const metadata = {
  title: "Meal Plan",
  description: "Restored meal planning workspace for Whiteloo members.",
};

export const dynamic = "force-dynamic";

export default async function MealPlanPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const meals = await listMealsForUser(user.id);

  return <MealPlanView user={user} initialMeals={meals.map((entry) => serializeDocument(entry))} />;
}
