"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { WorkspaceHeader } from "@/components/workspace-header";
import { apiFetch } from "@/lib/api";

function getStreak(steps) {
  let streak = 0;
  let previousDate = null;

  for (const step of steps) {
    const currentDate = new Date(step.date);
    if (!previousDate) {
      streak += 1;
      previousDate = currentDate;
      continue;
    }

    const diff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak += 1;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}

export function StepsView({ user, initialSteps }) {
  const [steps, setSteps] = useState(initialSteps);
  const [count, setCount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [steps]
  );

  const totalSteps = sortedSteps.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const streak = getStreak(sortedSteps);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await apiFetch("/api/steps", {
        method: "POST",
        body: {
          count: Number(count),
          date,
        },
      });

      setSteps((current) => [response.item, ...current]);
      setCount("");
      toast.success("Steps saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save steps.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/steps/${id}`, { method: "DELETE" });
      setSteps((current) => current.filter((entry) => entry.id !== id));
      toast.success("Step entry deleted.");
    } catch (error) {
      toast.error(error.message || "Unable to delete steps.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="grid-shell py-8 sm:py-10">
      <WorkspaceHeader
        user={user}
        title="Steps"
        subtitle="Restore the movement view with a cleaner, more premium layout."
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="space-y-5">
          <div className="panel p-5">
            <div className="eyebrow">Movement input</div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">Capture a step record.</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="number"
                min="1"
                value={count}
                onChange={(event) => setCount(event.target.value)}
                className="field h-12 w-full"
                placeholder="Steps"
                required
              />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="field h-12 w-full"
                required
              />
              <button type="submit" className="neon-button justify-center" disabled={saving}>
                {saving ? "Saving..." : "Add Steps"}
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel-strong p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Current streak</div>
              <div className="mt-3 text-4xl font-semibold text-neon">{streak}</div>
              <div className="mt-2 text-sm text-white/45">consecutive logged days</div>
            </div>
            <div className="panel-strong p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Total steps</div>
              <div className="mt-3 text-4xl font-semibold text-white">
                {new Intl.NumberFormat().format(totalSteps)}
              </div>
              <div className="mt-2 text-sm text-white/45">{sortedSteps.length} records captured</div>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Recent history</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">Movement timeline</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {sortedSteps.length === 0 ? (
              <div className="panel-muted px-4 py-8 text-center text-sm text-white/45">
                No step records yet.
              </div>
            ) : (
              sortedSteps.map((step) => (
                <div key={step.id} className="panel-muted p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {new Intl.NumberFormat().format(step.count)} steps
                      </div>
                      <div className="mt-1 text-sm text-white/45">{step.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(step.id)}
                      disabled={deletingId === step.id}
                      className="text-sm text-red-200 transition hover:text-red-100"
                    >
                      {deletingId === step.id ? "Deleting..." : "Delete"}
                    </button>
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
