import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function getStreak(steps) {
  let streak = 0;
  let prevDate = null;
  for (const s of steps) {
    if (s.count > 0) {
      const currDate = new Date(s.date);
      if (!prevDate || (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
        prevDate = currDate;
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
    setSteps(data);
  };

  useEffect(() => {
    fetchSteps();
    fetchProviders();
  }, []);

  const handleAddSteps = async (e) => {
    e.preventDefault();
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

  const streak = getStreak([...steps].sort((a, b) => new Date(b.date) - new Date(a.date)));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h2 className="text-3xl font-bold mb-4">Steps Tracker</h2>
      <div className="mb-4 text-lg font-semibold text-green-700">
        Current Streak: {streak} day{streak !== 1 ? 's' : ''}
      </div>

      <div className="w-full max-w-xl bg-white rounded border p-4 mb-5">
        <h3 className="font-semibold mb-2">Health App Sync</h3>
        {providers?.googleFit?.connected ? (
          <button
            onClick={handleGoogleFitSync}
            disabled={syncing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {syncing ? 'Syncing...' : 'Sync from Google Fit'}
          </button>
        ) : (
          <div className="text-sm text-gray-700">
            Login with <Link to="/auth" className="text-blue-700 underline">Google</Link> to enable Google Fit sync.
          </div>
        )}
        <div className="text-xs text-gray-500 mt-3">
          Google Fit sync is available after signing in with Google.
        </div>
        {syncMessage ? <div className="text-sm mt-3 text-gray-700">{syncMessage}</div> : null}
      </div>

      <form onSubmit={handleAddSteps} className="flex flex-col md:flex-row gap-2 mb-6 w-full max-w-xl">
        <input
          type="number"
          placeholder="Steps"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="px-3 py-2 border rounded w-full"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border rounded w-full"
          required
        />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
          Add
        </button>
      </form>

      <div className="w-full max-w-xl">
        <h3 className="text-xl font-semibold mb-2">Your Steps</h3>
        <ul className="divide-y divide-gray-200">
          {steps.map((s) => (
            <li key={s.id} className="flex justify-between items-center py-2">
              <div>
                <span className="font-medium">{s.count}</span> steps on {s.date}
                {s.source === 'google_fit' ? <span className="text-xs text-blue-700 ml-2">Google Fit</span> : null}
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">
                Delete
              </button>
            </li>
          ))}
          {steps.length === 0 ? <li className="text-gray-500 py-4 text-center">No steps logged yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}

export default Steps;
