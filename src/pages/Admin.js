import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

const ENTRY_TYPES = ['journal', 'meals', 'workouts', 'steps', 'healthData', 'users', 'connections', 'webhooks'];

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function Admin() {
  const [token, setToken] = useState('');
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState(null);
  const [activeType, setActiveType] = useState('journal');
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('admin_token') || '';
    if (stored) setToken(stored);
  }, []);

  const headers = useMemo(() => {
    if (!token.trim()) return {};
    return { 'x-admin-token': token.trim() };
  }, [token]);

  const parseJsonSafely = async (response) => {
    const text = await response.text();
    try {
      return { json: JSON.parse(text), text };
    } catch (_err) {
      return { json: null, text };
    }
  };

  const loadAdminData = async () => {
    if (!token.trim()) {
      setError('Enter admin token first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      window.localStorage.setItem('admin_token', token.trim());
      const [statsRes, entriesRes] = await Promise.all([
        apiFetch('/api/admin/stats', { headers }),
        apiFetch(`/api/admin/entries?limit=${limit}`, { headers }),
      ]);

      if (statsRes.status === 401 || entriesRes.status === 401) {
        setError('Invalid admin token.');
        setStats(null);
        setEntries(null);
        return;
      }
      if (!statsRes.ok || !entriesRes.ok) {
        const statsBody = await parseJsonSafely(statsRes);
        const entriesBody = await parseJsonSafely(entriesRes);
        const message = [
          `Failed to load admin data (${statsRes.status}/${entriesRes.status}).`,
          statsRes.url ? `stats url: ${statsRes.url}` : '',
          entriesRes.url ? `entries url: ${entriesRes.url}` : '',
          statsBody.json?.message || statsBody.json?.error || statsBody.text?.slice(0, 160) || '',
          entriesBody.json?.message || entriesBody.json?.error || entriesBody.text?.slice(0, 160) || '',
        ]
          .filter(Boolean)
          .join(' ');
        setError(message);
        setStats(null);
        setEntries(null);
        return;
      }

      const statsBody = await parseJsonSafely(statsRes);
      const entriesBody = await parseJsonSafely(entriesRes);
      if (!statsBody.json || !entriesBody.json) {
        setError('Admin API returned non-JSON response. Check Vercel routing for /api/*.');
        setStats(null);
        setEntries(null);
        return;
      }

      setStats(statsBody.json);
      setEntries(entriesBody.json);
    } catch (_err) {
      setError('Admin API request failed.');
      setStats(null);
      setEntries(null);
    } finally {
      setLoading(false);
    }
  };

  const activeItems = useMemo(() => {
    if (!entries || !activeType) return [];
    const list = entries[activeType];
    return Array.isArray(list) ? list : [];
  }, [entries, activeType]);

  return (
    <div className="page-shell pt-4">
      <div className="site-shell space-y-6">
        <section className="glass-panel-strong rounded-[32px] p-6 md:p-8">
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white md:text-4xl">Admin console</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">A cleaner operator view with responsive controls, smaller dead zones, and readable entry inspection on phone and desktop.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
            <input type="password" placeholder="Enter ADMIN_TOKEN" value={token} onChange={(e) => setToken(e.target.value)} className="field" />
            <input type="number" min="10" max="500" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 100)} className="field" />
            <button onClick={loadAdminData} disabled={loading} className="btn-primary justify-center disabled:opacity-50">
              {loading ? 'Loading...' : 'Load data'}
            </button>
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </section>

        {stats ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Users" value={stats.users?.total ?? 0} />
            <StatCard label="Active 24h" value={stats.users?.active24h ?? 0} />
            <StatCard label="Active 7d" value={stats.users?.active7d ?? 0} />
            <StatCard label="Total Logins" value={stats.users?.totalLogins ?? 0} />
          </section>
        ) : null}

        <section className="glass-panel rounded-[28px] p-5 md:p-6">
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeType === type ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-400">Showing {activeItems.length} {activeType} entries</div>

          <div className="mt-5 space-y-3">
            {activeItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-400">No entries loaded for this type.</div>
            ) : (
              activeItems.map((item, index) => (
                <pre key={item.id || `${activeType}-${index}`} className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs text-slate-200">
                  {JSON.stringify(item, null, 2)}
                </pre>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;
