import React from 'react';
import { Link } from 'react-router-dom';

const metrics = [
  { label: 'Daily flow', value: '60 sec', detail: 'to log a meaningful update' },
  { label: 'Connected data', value: 'Google Fit', detail: 'sync steps and workouts when ready' },
  { label: 'Focus', value: '1 workspace', detail: 'meals, movement, journal, progress' },
];

const pillars = [
  {
    title: 'Move with clarity',
    copy: 'Track workouts, steps, and health snapshots without digging through cluttered forms.',
  },
  {
    title: 'Reflect with context',
    copy: 'Pair numbers with journaling so progress feels human, not mechanical.',
  },
  {
    title: 'See momentum',
    copy: 'Use progress summaries and streaks to understand consistency at a glance.',
  },
];

function Landing() {
  return (
    <div className="page-shell pt-2">
      <div className="site-shell space-y-8">
        <section className="glass-panel-strong relative overflow-hidden rounded-[36px] px-6 py-10 md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(125,211,252,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(247,185,85,0.16),transparent_22%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-7">
              <span className="pill">A calmer way to track progress</span>
              <div className="space-y-5">
                <h1 className="font-['Space_Grotesk'] text-5xl font-bold leading-none tracking-tight text-slate-900 md:text-7xl">
                  Fitness, reflection, and momentum in one place.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Whitleos combines meals, workouts, steps, health snapshots, and journaling into one fast daily
                  workflow. Less logging friction. More visible progress.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/auth" className="btn-primary">
                  Start your daily flow
                </Link>
                <Link to="/progress" className="btn-secondary">
                  See the progress view
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="stat-card">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{metric.label}</div>
                    <div className="mt-3 text-3xl font-bold text-slate-900">{metric.value}</div>
                    <div className="mt-2 text-sm text-slate-600">{metric.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] border border-slate-200 bg-white/70 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em] text-sky-700">Today board</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">One glance, clear priorities.</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Ready
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Movement</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">Sync Google Fit or log a workout manually.</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Meals</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">Build your day from curated dishes or custom entries.</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Reflection</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">Capture what worked, what dipped, and what changes tomorrow.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[30px] border border-amber-200 bg-amber-50/80 p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-amber-700">Why it wins</div>
                <div className="mt-3 text-lg leading-8 text-slate-700">
                  Most trackers give you records. Whitleos should give you rhythm: a fast place to log, reflect, and
                  immediately understand momentum.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="glass-panel rounded-[28px] p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-sky-700">Pillar</div>
              <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-bold text-slate-900">{pillar.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{pillar.copy}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel rounded-[32px] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="pill">Built for repeat use</div>
              <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold text-slate-900">The goal is less friction, not more features.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Log quickly. Sync when it saves effort. Keep enough reflection to understand your patterns. Use the
                progress page to turn scattered entries into a story you can act on.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/mealplan" className="btn-secondary">
                Explore meals
              </Link>
              <Link to="/journal" className="btn-secondary">
                Open journal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Landing;
