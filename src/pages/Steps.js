import React, { useState, useEffect } from 'react';

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

  const fetchSteps = async () => {
    const res = await fetch('http://localhost:4000/api/steps', { credentials: 'include' });
    if (res.status === 401) return setSteps([]);
    const data = await res.json();
    setSteps(data);
  };

  useEffect(() => { fetchSteps(); }, []);

  const handleAddSteps = async (e) => {
    e.preventDefault();
    if (!count || !date) return;
    await fetch('http://localhost:4000/api/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ count: Number(count), date, created: new Date() }),
    });
    setCount('');
    fetchSteps();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:4000/api/steps/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchSteps();
  };

  const streak = getStreak([...steps].sort((a, b) => new Date(b.date) - new Date(a.date)));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h2 className="text-3xl font-bold mb-4">Steps & Run Tracker</h2>
      <div className="mb-4 text-lg font-semibold text-green-700">Current Streak: {streak} day{streak !== 1 ? 's' : ''}</div>
      <form onSubmit={handleAddSteps} className="flex flex-col md:flex-row gap-2 mb-6 w-full max-w-xl">
        <input type="number" placeholder="Steps" value={count} onChange={e => setCount(e.target.value)} className="px-3 py-2 border rounded w-full" required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border rounded w-full" required />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Add</button>
      </form>
      <div className="w-full max-w-xl">
        <h3 className="text-xl font-semibold mb-2">Your Steps</h3>
        <ul className="divide-y divide-gray-200">
          {steps.map(s => (
            <li key={s.id} className="flex justify-between items-center py-2">
              <div>
                <span className="font-medium">{s.count}</span> steps on {s.date}
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">Delete</button>
            </li>
          ))}
          {steps.length === 0 && <li className="text-gray-500 py-4 text-center">No steps logged yet.</li>}
        </ul>
      </div>
    </div>
  );
}

export default Steps; 