import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

function getBestStreak(steps) {
  let best = 0;
  let current = 0;
  let previousDate = null;
  const sorted = [...steps].sort((a, b) => new Date(b.date) - new Date(a.date));

  for (const step of sorted) {
    if (step.count > 0) {
      const currentDate = new Date(step.date);
      if (!previousDate || (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        current += 1;
        previousDate = currentDate;
      } else {
        best = Math.max(best, current);
        current = 1;
        previousDate = currentDate;
      }
    } else {
      best = Math.max(best, current);
      current = 0;
      previousDate = null;
    }
  }

  return Math.max(best, current);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function toDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getRecentSeries(items, key, days = 7) {
  const totals = new Map();
  items.forEach((item) => {
    const day = toDayKey(item.date || item.created);
    if (!day) return;
    totals.set(day, Number(totals.get(day) || 0) + Number(item[key] || 0));
  });

  const series = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const current = new Date(now);
    current.setDate(now.getDate() - i);
    const day = current.toISOString().slice(0, 10);
    series.push({ day, value: Number(totals.get(day) || 0) });
  }

  return series;
}

function getDailyAverage(series) {
  if (!series.length) return 0;
  const total = series.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return Math.round(total / series.length);
}

function getTopWorkout(workouts) {
  const ranking = new Map();
  workouts.forEach((workout) => {
    const key = workout.exercise || 'Workout';
    ranking.set(key, Number(ranking.get(key) || 0) + Number(workout.duration || 0));
  });

  const sorted = [...ranking.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0] || ['None yet', 0];
}

function getRecentHighlights({ meals, workouts, steps, journals }) {
  const items = [
    ...meals.map((item) => ({
      id: `meal-${item.id}`,
      label: item.name || 'Meal',
      meta: `${item.calories || 0} kcal`,
      date: item.date || item.created,
      type: 'Meal',
    })),
    ...workouts.map((item) => ({
      id: `workout-${item.id}`,
      label: item.exercise || 'Workout',
      meta: `${item.duration || 0} min`,
      date: item.date || item.created,
      type: 'Workout',
    })),
    ...steps.map((item) => ({
      id: `steps-${item.id}`,
      label: 'Steps logged',
      meta: `${item.count || 0} steps`,
      date: item.date || item.created,
      type: 'Steps',
    })),
    ...journals.map((item) => ({
      id: `journal-${item.id}`,
      label: item.title || 'Journal entry',
      meta: 'Reflection added',
      date: item.date || item.created,
      type: 'Journal',
    })),
  ];

  return items
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
}

function Progress() {
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [steps, setSteps] = useState([]);
  const [journals, setJournals] = useState([]);
  const [healthSummary, setHealthSummary] = useState({ latest: null, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');
        const [mealResponse, workoutResponse, stepsResponse, journalResponse, healthResponse] = await Promise.all([
          apiFetch('/api/meals'),
          apiFetch('/api/workouts'),
          apiFetch('/api/steps'),
          apiFetch('/api/journal'),
          apiFetch('/api/health-data/summary'),
        ]);

        setMeals(mealResponse.status === 200 ? await mealResponse.json() : []);
        setWorkouts(workoutResponse.status === 200 ? await workoutResponse.json() : []);
        setSteps(stepsResponse.status === 200 ? await stepsResponse.json() : []);
        setJournals(journalResponse.status === 200 ? await journalResponse.json() : []);
        setHealthSummary(healthResponse.status === 200 ? await healthResponse.json() : { latest: null, count: 0 });
      } catch (_err) {
        setError('Unable to load progress right now. Sign in first if your session has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, workout) => sum + Number(workout.duration || 0), 0);
  const totalSteps = steps.reduce((sum, step) => sum + Number(step.count || 0), 0);
  const bestStreak = getBestStreak(steps);
  const journalCount = journals.length;
  const latestHealth = healthSummary?.latest || null;
  const latestHealthCalories = Number(latestHealth?.caloriesBurned || 0);
  const healthRecordCount = Number(healthSummary?.count || 0);
  const recentSteps = getRecentSeries(steps, 'count', 7);
  const recentWorkoutMinutes = getRecentSeries(workouts, 'duration', 7);
  const averageSteps = getDailyAverage(recentSteps);
  const averageWorkoutMinutes = getDailyAverage(recentWorkoutMinutes);
  const [topWorkout, topWorkoutMinutes] = getTopWorkout(workouts);
  const highlights = getRecentHighlights({ meals, workouts, steps, journals });
  const momentumScore = Math.min(
    100,
    Math.round(
      totalSteps / 1200 +
        totalDuration / 8 +
        journalCount * 6 +
        healthRecordCount * 5 +
        Math.min(bestStreak * 4, 28)
    )
  );
  const consistencySignal =
    bestStreak >= 5
      ? 'Your consistency is building. Keep the daily rhythm simple.'
      : 'The biggest gain is consistency. One small log a day is enough to build momentum.';

  const cards = [
    { label: 'Meal energy logged', value: `${formatNumber(totalCalories)} kcal`, note: `${meals.length} entries recorded` },
    { label: 'Workout time', value: `${formatNumber(totalDuration)} min`, note: `${averageWorkoutMinutes} min/day over the last 7 days` },
    { label: 'Steps', value: formatNumber(totalSteps), note: `Best streak: ${bestStreak} day${bestStreak !== 1 ? 's' : ''}` },
    { label: 'Journal reflections', value: formatNumber(journalCount), note: 'Use writing to add context to physical progress' },
  ];

  return (
    <div className="page-shell pt-2">
      <div className="site-shell space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="pill">Progress command center</div>
              <h1 className="mt-5 font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-white md:text-5xl">
                Your activity is only useful when it becomes direction.
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                This view turns logged meals, movement, and journal entries into a clearer signal. The point is not
                perfect tracking. The point is usable momentum.
              </p>
            </div>
            <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-sky-200">Momentum score</div>
              <div className="mt-4 text-6xl font-bold text-white">{loading ? '--' : momentumScore}</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">{loading ? 'Loading your recent signal...' : consistencySignal}</div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-2xl bg-black/20 p-3">
                  <div className="text-slate-400">Average steps</div>
                  <div className="mt-1 text-xl font-semibold text-white">{formatNumber(averageSteps)}</div>
                </div>
                <div className="rounded-2xl bg-black/20 p-3">
                  <div className="text-slate-400">Top workout</div>
                  <div className="mt-1 text-xl font-semibold text-white">{topWorkoutMinutes ? topWorkout : 'None yet'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[24px] border border-red-400/30 bg-red-300/10 px-5 py-4 text-sm text-red-100">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="glass-panel rounded-[28px] p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.label}</div>
              <div className="mt-3 text-3xl font-bold text-white">{loading ? '--' : card.value}</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">{card.note}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-sky-200">Last 7 days</div>
                <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">Daily signal</h2>
              </div>
              <div className="text-sm text-slate-400">A quick read on consistency, not perfection.</div>
            </div>
            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-3 text-sm font-semibold text-white">Steps</div>
                <div className="grid grid-cols-7 gap-2">
                  {recentSteps.map((item) => (
                    <div key={item.day} className="rounded-2xl bg-white/5 p-3 text-center">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.day.slice(5)}</div>
                      <div className="mt-4 h-24 rounded-full bg-slate-950/60 p-2">
                        <div
                          className="mx-auto rounded-full bg-gradient-to-t from-sky-500 to-cyan-300"
                          style={{ height: `${Math.max(10, Math.min(100, item.value / 120))}%`, width: '100%' }}
                        />
                      </div>
                      <div className="mt-3 text-sm font-semibold text-white">{formatNumber(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/15 p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-amber-200">Health snapshot</div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-slate-400">Latest calories burned</div>
                    <div className="mt-1 text-2xl font-bold text-white">{formatNumber(latestHealthCalories)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Records saved</div>
                    <div className="mt-1 text-2xl font-bold text-white">{formatNumber(healthRecordCount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Latest source</div>
                    <div className="mt-1 text-2xl font-bold text-white">{latestHealth?.source || 'manual'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="glass-panel rounded-[30px] p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-sky-200">Recent highlights</div>
              <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">What actually happened</h2>
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="text-sm text-slate-400">Loading recent activity...</div>
                ) : highlights.length === 0 ? (
                  <div className="text-sm text-slate-400">No recent activity yet. Start logging to build your timeline.</div>
                ) : (
                  highlights.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm uppercase tracking-[0.18em] text-slate-500">{item.type}</div>
                          <div className="mt-1 text-base font-semibold text-white">{item.label}</div>
                        </div>
                        <div className="text-sm text-slate-400">{item.date}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-300">{item.meta}</div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="glass-panel rounded-[30px] p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-amber-200">Coach note</div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                <p>
                  {averageSteps >= 6000
                    ? 'Your recent step average is solid. Protect the habit by making the easiest days feel automatic.'
                    : 'Your step average suggests inconsistency. Start by protecting one minimum daily movement target.'}
                </p>
                <p>
                  {topWorkoutMinutes > 0
                    ? `${topWorkout} is currently your strongest workout signal at ${topWorkoutMinutes} minutes total.`
                    : 'You have not logged enough workout data yet to surface a dominant pattern.'}
                </p>
                <p>
                  Journal entries matter because they explain the why behind the numbers. Use them to capture energy,
                  focus, recovery, and friction.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Progress;
