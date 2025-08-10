import React, { useEffect, useState } from 'react';

function getBestStreak(steps) {
  let best = 0, curr = 0, prevDate = null;
  const sorted = [...steps].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const s of sorted) {
    if (s.count > 0) {
      const currDate = new Date(s.date);
      if (!prevDate || (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        curr++;
        prevDate = currDate;
      } else {
        best = Math.max(best, curr);
        curr = 1;
        prevDate = currDate;
      }
    } else {
      best = Math.max(best, curr);
      curr = 0;
      prevDate = null;
    }
  }
  return Math.max(best, curr);
}

function Progress() {
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [steps, setSteps] = useState([]);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [m, w, s, j] = await Promise.all([
        fetch('http://localhost:4000/api/meals', { credentials: 'include' }),
        fetch('http://localhost:4000/api/workouts', { credentials: 'include' }),
        fetch('http://localhost:4000/api/steps', { credentials: 'include' }),
        fetch('http://localhost:4000/api/journal', { credentials: 'include' }),
      ]);
      setMeals(m.status === 200 ? await m.json() : []);
      setWorkouts(w.status === 200 ? await w.json() : []);
      setSteps(s.status === 200 ? await s.json() : []);
      setJournals(j.status === 200 ? await j.json() : []);
    };
    fetchAll();
  }, []);

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalSteps = steps.reduce((sum, s) => sum + (s.count || 0), 0);
  const bestStreak = getBestStreak(steps);
  const journalCount = journals.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h2 className="text-3xl font-bold mb-6">Progress & Streaks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-xl font-semibold mb-2">Meals</h3>
          <div className="text-2xl font-bold">{totalCalories} kcal</div>
          <div className="text-gray-500">Total Calories Consumed</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-xl font-semibold mb-2">Workouts</h3>
          <div className="text-2xl font-bold">{totalDuration} min</div>
          <div className="text-gray-500">Total Workout Duration</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-xl font-semibold mb-2">Steps</h3>
          <div className="text-2xl font-bold">{totalSteps}</div>
          <div className="text-gray-500">Total Steps</div>
          <div className="mt-2 text-green-700 font-semibold">Best Streak: {bestStreak} day{bestStreak !== 1 ? 's' : ''}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-xl font-semibold mb-2">Journal</h3>
          <div className="text-2xl font-bold">{journalCount}</div>
          <div className="text-gray-500">Entries Written</div>
        </div>
      </div>
    </div>
  );
}

export default Progress; 