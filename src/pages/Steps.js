import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function getStreak(steps) {
  let streak = 0;
  let prevDate = null;
  for (const step of steps) {
    if (step.count > 0) {
      const currentDate = new Date(step.date);
      if (!prevDate || (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        streak += 1;
        prevDate = currentDate;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

function Steps() {
  const [count, setCount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [steps, setSteps] = useState([]);
  const [providers, setProviders] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchProviders = async () => {
    const res = await apiFetch('/api/health/providers');
    if (!res.ok) return setProviders(null);
    const data = await res.json();
    setProviders(data);
  };

  const fetchSteps = async () => {
    const res = await apiFetch('/api/steps');
    if (res.status === 401) return setSteps([]);
    const data = await res.json();
    setSteps(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchSteps();
    fetchProviders();
  }, []);

  const handleAddSteps = async (event) => {
    event.preventDefault();
    if (!count || !date) return;
    await apiFetch('/api/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: Number(count), date, created: new Date().toISOString() }),
    });
    setCount('');
    fetchSteps();
  };

  const handleDelete = async (id) => {
    await apiFetch(`/api/steps/${id}`, { method: 'DELETE' });
    fetchSteps();
  };

  const handleGoogleFitSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage('');
      const res = await apiFetch('/api/sync/google-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSyncMessage(data.message || 'Sync failed.');
        return;
      }
      setSyncMessage(`Synced ${data.stepsSynced} step records and ${data.workoutsSynced} workouts from Google Fit.`);
      fetchSteps();
    } catch (_err) {
      setSyncMessage('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const sortedSteps = useMemo(() => [...steps].sort((a, b) => new Date(b.date) - new Date(a.date)), [steps]);
  const streak = getStreak(sortedSteps);
  const totalSteps = sortedSteps.reduce((sum, item) => sum + Number(item.count || 0), 0);

  return (
    <div className="page-shell pt-4">
      <div className="site-shell space-y-6">
        <section className="glass-panel-strong rounded-[32px] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="pill">Movement tracking</div>
              <h1 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold text-white md:text-4xl">Protect your step rhythm without wasting screen space.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Log steps manually or connect Google Fit. This page now keeps your key actions, streak, and recent
                records in one compact mobile-friendly flow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Current streak</div>
                <div className="mt-2 text-3xl font-bold text-white">{streak}</div>
                <div className="mt-2 text-sm text-slate-400">day{streak !== 1 ? 's' : ''} in sequence</div>
              </div>
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Total logged</div>
                <div className="mt-2 text-3xl font-bold text-white">{new Intl.NumberFormat().format(totalSteps)}</div>
                <div className="mt-2 text-sm text-slate-400">{sortedSteps.length} records captured</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="glass-panel rounded-[28px] p-5 md:p-6">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">Health app sync</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Sign in with Google to import your step history and workouts from Google Fit.
            </p>
            <div className="mt-5">
              {providers?.googleFit?.connected ? (
                <button onClick={handleGoogleFitSync} disabled={syncing} className="btn-primary w-full justify-center disabled:opacity-60">
                  {syncing ? 'Syncing...' : 'Sync from Google Fit'}
                </button>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                  Login with <Link to="/auth" className="text-sky-200 underline">Google</Link> to enable Google Fit sync.
                </div>
              )}
              {syncMessage ? <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-200">{syncMessage}</div> : null}
            </div>

            <form onSubmit={handleAddSteps} className="mt-6 space-y-3">
              <input
                type="number"
                placeholder="Steps"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="field"
                required
              />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" required />
              <button type="submit" className="btn-secondary w-full justify-center">
                Add steps manually
              </button>
            </form>
          </section>

          <section className="glass-panel rounded-[28px] p-5 md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">Recent step history</h2>
                <p className="mt-1 text-sm text-slate-400">Most recent entries first. Google Fit imports are labeled.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sortedSteps.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
                  No steps logged yet.
                </div>
              ) : (
                sortedSteps.map((step) => (
                  <div key={step.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{new Intl.NumberFormat().format(step.count)} steps</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {step.date}
                        {step.source === 'google_fit' ? <span className="ml-2 text-sky-200">Google Fit</span> : null}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(step.id)} className="text-left text-sm text-red-200 transition hover:text-red-100 sm:text-right">
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Steps;
