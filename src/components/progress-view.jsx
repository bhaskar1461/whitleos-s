"use client";

import { WorkspaceHeader } from "@/components/workspace-header";

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function getBestStreak(steps) {
  const sorted = [...steps].sort((a, b) => new Date(b.date) - new Date(a.date));
  let best = 0;
  let current = 0;
  let previousDate = null;

  for (const step of sorted) {
    const currentDate = new Date(step.date);
    if (!previousDate) {
      current = 1;
      previousDate = currentDate;
      best = Math.max(best, current);
      continue;
    }

    const diff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current += 1;
    } else {
      current = 1;
    }
    previousDate = currentDate;
    best = Math.max(best, current);
  }

  return best;
}

function getTopWorkout(workouts) {
  const ranking = new Map();
  workouts.forEach((workout) => {
    ranking.set(
      workout.exercise,
      Number(ranking.get(workout.exercise) || 0) + Number(workout.duration || 0)
    );
  });
  return [...ranking.entries()].sort((a, b) => b[1] - a[1])[0] || null;
}

function getHighlights({ meals, workouts, steps, journals }) {
  const items = [
    ...meals.map((item) => ({
      id: `meal-${item.id}`,
      label: item.name,
      meta: `${item.calories} kcal`,
      date: item.date,
      type: "Meal",
    })),
    ...workouts.map((item) => ({
      id: `workout-${item.id}`,
      label: item.exercise,
      meta: `${item.duration} min`,
      date: item.date,
      type: "Workout",
    })),
    ...steps.map((item) => ({
      id: `steps-${item.id}`,
      label: "Steps logged",
      meta: `${formatNumber(item.count)} steps`,
      date: item.date,
      type: "Steps",
    })),
    ...journals.map((item) => ({
      id: `journal-${item.id}`,
      label: item.title,
      meta: "Reflection added",
      date: item.date,
      type: "Journal",
    })),
  ];

  return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
}

export function ProgressView({ user, meals, workouts, steps, journals }) {
  const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, workout) => sum + Number(workout.duration || 0), 0);
  const totalSteps = steps.reduce((sum, step) => sum + Number(step.count || 0), 0);
  const bestStreak = getBestStreak(steps);
  const topWorkout = getTopWorkout(workouts);
  const highlights = getHighlights({ meals, workouts, steps, journals });

  const momentumScore = Math.min(
    100,
    Math.round(totalCalories / 90 + totalDuration / 5 + totalSteps / 1500 + journals.length * 4)
  );

  const cards = [
    { label: "Meal energy", value: `${formatNumber(totalCalories)} kcal`, note: `${meals.length} entries` },
    { label: "Workout time", value: `${formatNumber(totalDuration)} min`, note: `${workouts.length} sessions` },
    { label: "Steps logged", value: formatNumber(totalSteps), note: `${steps.length} records` },
    { label: "Journal entries", value: formatNumber(journals.length), note: "Reflection depth" },
  ];

  return (
    <div className="grid-shell py-8 sm:py-10">
      <WorkspaceHeader
        user={user}
        title="Progress"
        subtitle="A premium snapshot of what the restored tracking pages are actually producing."
      />

      <section className="panel mt-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="eyebrow">Command center</div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">
              Your activity becomes useful when it becomes direction.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">
              Meals, movement, and reflections are back in one workspace. This page summarizes the signal in the same
              Whiteloo style as the rest of the platform.
            </p>
          </div>
          <div className="panel-strong p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">Momentum score</div>
            <div className="mt-4 text-6xl font-semibold text-neon">{momentumScore}</div>
            <div className="mt-3 text-sm leading-7 text-white/55">
              {bestStreak >= 5
                ? "Consistency is compounding. Keep protecting the minimum daily rhythm."
                : "Momentum grows from repeatable entries. A little logged every day beats a perfect week."}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="panel-strong p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{card.value}</div>
            <div className="mt-2 text-sm text-white/45">{card.note}</div>
          </div>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="panel p-5">
          <div className="eyebrow">Recent highlights</div>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">What actually happened</h2>
          <div className="mt-5 space-y-3">
            {highlights.length === 0 ? (
              <div className="panel-muted px-4 py-8 text-center text-sm text-white/45">
                No activity yet. Use the restored pages to start building your timeline.
              </div>
            ) : (
              highlights.map((item) => (
                <div key={item.id} className="panel-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-white/35">{item.type}</div>
                      <div className="mt-2 text-base font-semibold text-white">{item.label}</div>
                      <div className="mt-1 text-sm text-white/55">{item.meta}</div>
                    </div>
                    <div className="text-sm text-white/40">{item.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel-strong p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">Best streak</div>
            <div className="mt-3 text-4xl font-semibold text-neon">{bestStreak}</div>
            <div className="mt-2 text-sm text-white/45">consecutive logged step days</div>
          </div>

          <div className="panel-strong p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">Top workout</div>
            <div className="mt-3 text-2xl font-semibold text-white">
              {topWorkout ? topWorkout[0] : "No dominant pattern yet"}
            </div>
            <div className="mt-2 text-sm text-white/45">
              {topWorkout ? `${topWorkout[1]} total minutes logged` : "Add more training data to surface trends."}
            </div>
          </div>

          <div className="panel p-5">
            <div className="eyebrow">Coach note</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
              <p>
                Your restored workspace now mirrors the original utility pages but with the same premium tone as the
                Whiteloo landing and dashboard.
              </p>
              <p>
                Use meals for intake, workouts for effort, steps for rhythm, and journal entries for context. That
                combination gives this summary page real signal instead of decorative numbers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
