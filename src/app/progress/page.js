import { redirect } from "next/navigation";

import { ProgressView } from "@/components/progress-view";
import { getSessionUser } from "@/lib/auth";
import {
  listJournalEntriesForUser,
  listMealsForUser,
  listStepsForUser,
  listWorkoutsForUser,
} from "@/lib/store";
import { serializeDocument } from "@/lib/utils";

export const metadata = {
  title: "Progress",
  description: "Whiteloo progress command center built from restored workspace pages.",
};

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [meals, workouts, steps, journals] = await Promise.all([
    listMealsForUser(user.id),
    listWorkoutsForUser(user.id),
    listStepsForUser(user.id),
    listJournalEntriesForUser(user.id),
  ]);

  return (
    <ProgressView
      user={user}
      meals={meals.map((entry) => serializeDocument(entry))}
      workouts={workouts.map((entry) => serializeDocument(entry))}
      steps={steps.map((entry) => serializeDocument(entry))}
      journals={journals.map((entry) => serializeDocument(entry))}
    />
  );
}
