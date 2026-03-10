import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [providers, setProviders] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchWorkouts = async () => {
    const res = await apiFetch('/api/workouts');
    if (res.status === 401) return setWorkouts([]);
    const data = await res.json();
    setWorkouts(data);
  };

  const fetchProviders = async () => {
    const res = await apiFetch('/api/health/providers');
    if (!res.ok) return setProviders(null);
    const data = await res.json();
    setProviders(data);
  };

  useEffect(() => {
    fetchWorkouts();
    fetchProviders();
  }, []);

  const totalDuration = useMemo(() => {
    return workouts.reduce((sum, workout) => sum + Number(workout.duration || 0), 0);
  }, [workouts]);

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    if (!exercise || !duration || !date) return;
    await apiFetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exercise,
        duration: Number(duration),
        date,
        created: new Date().toISOString(),
      }),
    });
    setExercise('');
    setDuration('');
    fetchWorkouts();
  };

  const handleDeleteWorkout = async (id) => {
    await apiFetch(`/api/workouts/${id}`, { method: 'DELETE' });
    fetchWorkouts();
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
      setSyncMessage(`Synced ${data.workoutsSynced} workouts and ${data.stepsSynced} step records from Google Fit.`);
      fetchWorkouts();
    } catch (_err) {
      setSyncMessage('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="page-shell pt-4">
      <div className="site-shell max-w-5xl">
        <div className="glass-panel-strong rounded-[30px] p-6">
          <h2 className="text-3xl font-extrabold text-slate-900">Workout Tracker</h2>
          <p className="mt-2 text-slate-600">
            Track workouts manually or sync from Google Fit after Google login.
          </p>
          <div className="mt-4 text-sm font-semibold text-sky-700">Total workout time: {totalDuration} min</div>
        </div>

        <div className="glass-panel rounded-[28px] p-6 mt-6">
          <h3 className="mb-3 text-xl font-semibold text-slate-900">Health App Sync</h3>
          {providers?.googleFit?.connected ? (
            <button
              onClick={handleGoogleFitSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Sync from Google Fit'}
            </button>
          ) : (
            <div className="text-sm text-slate-600">
              Login with <Link to="/auth" className="text-sky-700 underline">Google</Link> to enable sync.
            </div>
          )}
          <div className="mt-3 text-xs text-slate-500">
            Google Fit sync is available after signing in with Google.
          </div>
          {syncMessage ? <div className="mt-3 text-sm text-slate-700">{syncMessage}</div> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="glass-panel rounded-[28px] p-6">
            <h3 className="mb-4 text-xl font-semibold text-slate-900">Add Workout</h3>
            <form onSubmit={handleAddWorkout} className="space-y-3">
              <input
                type="text"
                placeholder="Exercise name"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="field"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Duration (minutes)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="field"
                required
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field"
                required
              />
              <button type="submit" className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500">
                Add Workout
              </button>
            </form>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <h3 className="mb-4 text-xl font-semibold text-slate-900">Workout History</h3>
            <ul className="max-h-[420px] divide-y divide-slate-200 overflow-y-auto">
              {workouts.map((workout) => (
                <li key={workout.id} className="py-3 flex justify-between items-center gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{workout.exercise || 'Workout'}</div>
                    <div className="text-sm text-slate-500">
                      {workout.duration} min on {workout.date}
                      {workout.source === 'google_fit' ? <span className="ml-2 text-sky-700">Google Fit</span> : null}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="text-red-300 hover:text-red-200 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {workouts.length === 0 ? <li className="py-3 text-sm text-slate-500">No workouts logged yet.</li> : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workout;
