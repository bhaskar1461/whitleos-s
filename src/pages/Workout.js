import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [providers, setProviders] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchWorkouts = async () => {
    const res = await fetch('/api/workouts', { credentials: 'include' });
    if (res.status === 401) return setWorkouts([]);
    const data = await res.json();
    setWorkouts(data);
  };

  const fetchProviders = async () => {
    const res = await fetch('/api/health/providers', { credentials: 'include' });
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
    await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    await fetch(`/api/workouts/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchWorkouts();
  };

  const handleGoogleFitSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage('');
      const res = await fetch('/api/sync/google-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    <div className="min-h-screen bg-[#121214] text-gray-200 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-3xl font-extrabold text-white">Workout Tracker</h2>
          <p className="text-gray-300 mt-2">
            Track workouts manually or sync from Google Fit after Google login.
          </p>
          <div className="mt-4 text-sm text-lime-300 font-semibold">Total workout time: {totalDuration} min</div>
        </div>

        <div className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-3">Health App Sync</h3>
          {providers?.googleFit?.connected ? (
            <button
              onClick={handleGoogleFitSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Sync from Google Fit'}
            </button>
          ) : (
            <div className="text-sm text-gray-300">
              Login with <Link to="/auth" className="text-blue-300 underline">Google</Link> to enable sync.
            </div>
          )}
          <div className="text-xs text-gray-400 mt-3">
            Google Fit sync is available after signing in with Google.
          </div>
          {syncMessage ? <div className="text-sm mt-3 text-gray-200">{syncMessage}</div> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add Workout</h3>
            <form onSubmit={handleAddWorkout} className="space-y-3">
              <input
                type="text"
                placeholder="Exercise name"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Duration (minutes)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
                required
              />
              <button type="submit" className="bg-lime-400 text-gray-900 font-semibold px-4 py-2 rounded hover:bg-lime-300">
                Add Workout
              </button>
            </form>
          </div>

          <div className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Workout History</h3>
            <ul className="divide-y divide-gray-700/50 max-h-[420px] overflow-y-auto">
              {workouts.map((workout) => (
                <li key={workout.id} className="py-3 flex justify-between items-center gap-3">
                  <div>
                    <div className="text-white font-medium">{workout.exercise || 'Workout'}</div>
                    <div className="text-sm text-gray-400">
                      {workout.duration} min on {workout.date}
                      {workout.source === 'google_fit' ? <span className="text-blue-300 ml-2">Google Fit</span> : null}
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
              {workouts.length === 0 ? <li className="py-3 text-gray-400 text-sm">No workouts logged yet.</li> : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workout;
