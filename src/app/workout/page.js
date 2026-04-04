import { redirect } from "next/navigation";

import { WorkoutView } from "@/components/workout-view";
import { getSessionUser } from "@/lib/auth";
import { listWorkoutsForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";

export const metadata = {
  title: "Workout",
  description: "Restored workout tracker with Whiteloo premium styling.",
};

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const workouts = await listWorkoutsForUser(user.id);

  return (
    <WorkoutView
      user={user}
      initialWorkouts={workouts.map((entry) => serializeDocument(entry))}
    />
  );
}
