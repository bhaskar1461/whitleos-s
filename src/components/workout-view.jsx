"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { WorkspaceHeader } from "@/components/workspace-header";
import { apiFetch } from "@/lib/api";

export function WorkoutView({ user, initialWorkouts }) {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [form, setForm] = useState({
    exercise: "",
    duration: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const totalDuration = useMemo(
    () => workouts.reduce((sum, workout) => sum + Number(workout.duration || 0), 0),
    [workouts]
  );

  const topExercise = useMemo(() => {
    const ranking = new Map();
    workouts.forEach((workout) => {
      const label = workout.exercise || "Workout";
      ranking.set(label, Number(ranking.get(label) || 0) + Number(workout.duration || 0));
    });

    return [...ranking.entries()].sort((a, b) => b[1] - a[1])[0] || null;
  }, [workouts]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await apiFetch("/api/workouts", {
        method: "POST",
        body: {
          exercise: form.exercise,
          duration: Number(form.duration),
          date: form.date,
        },
      });

      setWorkouts((current) => [response.item, ...current]);
      setForm({
        exercise: "",
        duration: "",
        date: new Date().toISOString().slice(0, 10),
      });
      toast.success("Workout saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save workout.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/workouts/${id}`, { method: "DELETE" });
      setWorkouts((current) => current.filter((workout) => workout.id !== id));
      toast.success("Workout deleted.");
    } catch (error) {
      toast.error(error.message || "Unable to delete workout.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="grid-shell py-8 sm:py-10">
      <WorkspaceHeader
        user={user}
        title="Workout Tracker"
        subtitle="Manual tracking is back, now wrapped in the Whiteloo premium interface."
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="space-y-5">
          <div className="panel p-5">
            <div className="eyebrow">Performance input</div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">Log a training session.</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                value={form.exercise}
                onChange={(event) => setForm((current) => ({ ...current, exercise: event.target.value }))}
                placeholder="Exercise or session name"
                className="field h-12 w-full"
                required
              />
              <input
                type="number"
                min="1"
                value={form.duration}
                onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                placeholder="Duration in minutes"
                className="field h-12 w-full"
                required
              />
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="field h-12 w-full"
                required
              />
              <button type="submit" className="neon-button justify-center" disabled={saving}>
                {saving ? "Saving..." : "Add Workout"}
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel-strong p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Total duration</div>
              <div className="mt-3 text-4xl font-semibold text-white">{totalDuration} min</div>
            </div>
            <div className="panel-strong p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Top exercise</div>
              <div className="mt-3 text-xl font-semibold text-neon">
                {topExercise ? topExercise[0] : "No data yet"}
              </div>
              <div className="mt-2 text-sm text-white/45">
                {topExercise ? `${topExercise[1]} total minutes` : "Add sessions to surface trends."}
              </div>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">History</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">Workout timeline</h2>
            </div>
            <div className="text-sm text-white/45">{workouts.length} sessions</div>
          </div>

          <div className="mt-5 space-y-3">
            {workouts.length === 0 ? (
              <div className="panel-muted px-4 py-8 text-center text-sm text-white/45">
                No workouts logged yet.
              </div>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="panel-muted p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{workout.exercise}</div>
                      <div className="mt-1 text-sm text-white/45">{workout.date}</div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-sm font-medium text-neon">{workout.duration} min</div>
                      <button
                        type="button"
                        onClick={() => handleDelete(workout.id)}
                        disabled={deletingId === workout.id}
                        className="text-sm text-red-200 transition hover:text-red-100"
                      >
                        {deletingId === workout.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
