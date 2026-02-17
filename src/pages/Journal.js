import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

function Journal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    const res = await apiFetch('/api/journal');
    if (res.status === 401) return setEntries([]);
    const data = await res.json();
    setEntries(data);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!title || !content || !date) return;
    await apiFetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, date, created: new Date() }),
    });
    setTitle('');
    setContent('');
    fetchEntries();
  };

  const handleDelete = async (id) => {
    await apiFetch(`/api/journal/${id}`, { method: 'DELETE' });
    fetchEntries();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h2 className="text-3xl font-bold mb-4">Journal</h2>
      <form onSubmit={handleAddEntry} className="flex flex-col gap-2 mb-6 w-full max-w-xl">
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="px-3 py-2 border rounded w-full" required />
        <textarea placeholder="Write your thoughts..." value={content} onChange={e => setContent(e.target.value)} className="px-3 py-2 border rounded w-full min-h-[100px]" required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border rounded w-full" required />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Add Entry</button>
      </form>
      <div className="w-full max-w-xl">
        <h3 className="text-xl font-semibold mb-2">Your Journal Entries</h3>
        <ul className="divide-y divide-gray-200">
          {entries.map(e => (
            <li key={e.id} className="py-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{e.title}</span> on {e.date}
                </div>
                <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:underline">Delete</button>
              </div>
              <div className="text-gray-700 mt-1 whitespace-pre-line">{e.content}</div>
            </li>
          ))}
          {entries.length === 0 && <li className="text-gray-500 py-4 text-center">No journal entries yet.</li>}
        </ul>
      </div>
    </div>
  );
}

export default Journal; 
