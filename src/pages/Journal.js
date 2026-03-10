import React, { useEffect, useMemo, useState } from 'react';
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
    setEntries(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAddEntry = async (event) => {
    event.preventDefault();
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

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => new Date(b.date || b.created) - new Date(a.date || a.created)), [entries]);

  return (
    <div className="page-shell pt-4">
      <div className="site-shell space-y-6">
        <section className="glass-panel-strong rounded-[32px] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="pill">Reflection layer</div>
              <h1 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold text-white md:text-4xl">Give your numbers context.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                The journal is where fatigue, focus, motivation, and friction become visible. Keep the form light so it
                works on desktop and on a phone between sets, meetings, or meals.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Entries</div>
                <div className="mt-2 text-3xl font-bold text-white">{sortedEntries.length}</div>
                <div className="mt-2 text-sm text-slate-400">written so far</div>
              </div>
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest date</div>
                <div className="mt-2 text-2xl font-bold text-white">{sortedEntries[0]?.date || 'None yet'}</div>
                <div className="mt-2 text-sm text-slate-400">most recent reflection</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="glass-panel rounded-[28px] p-5 md:p-6">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">New entry</h2>
            <form onSubmit={handleAddEntry} className="mt-5 space-y-3">
              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="field" required />
              <textarea
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="field min-h-[180px] resize-y"
                required
              />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" required />
              <button type="submit" className="btn-primary w-full justify-center">
                Save reflection
              </button>
            </form>
          </section>

          <section className="glass-panel rounded-[28px] p-5 md:p-6">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">Your journal timeline</h2>
            <div className="mt-5 space-y-3">
              {sortedEntries.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
                  No journal entries yet.
                </div>
              ) : (
                sortedEntries.map((entry) => (
                  <article key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                        <div className="mt-1 text-sm text-slate-400">{entry.date}</div>
                      </div>
                      <button onClick={() => handleDelete(entry.id)} className="text-left text-sm text-red-200 transition hover:text-red-100">
                        Delete
                      </button>
                    </div>
                    <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{entry.content}</div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Journal;
