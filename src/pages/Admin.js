import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

const ENTRY_TYPES = ['journal', 'meals', 'workouts', 'steps', 'healthData', 'users', 'connections', 'webhooks'];

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
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
      const statsData = statsBody.json;
      const entriesData = entriesBody.json;
      setStats(statsData);
      setEntries(entriesData);
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
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white border rounded p-6">
          <h2 className="text-3xl font-bold text-gray-900">Admin Console</h2>
          <p className="text-gray-600 mt-2">View user activity and all stored entries.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="password"
              placeholder="Enter ADMIN_TOKEN"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="md:col-span-2 border rounded px-3 py-2"
            />
            <input
              type="number"
              min="10"
              max="500"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 100)}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Data'}
            </button>
          </div>
          {error ? <div className="text-sm text-red-600 mt-3">{error}</div> : null}
        </header>

        {stats ? (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Users" value={stats.users?.total ?? 0} />
            <StatCard label="Active 24h" value={stats.users?.active24h ?? 0} />
            <StatCard label="Active 7d" value={stats.users?.active7d ?? 0} />
            <StatCard label="Total Logins" value={stats.users?.totalLogins ?? 0} />
          </section>
        ) : null}

        <section className="bg-white border rounded p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {ENTRY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded text-sm border ${
                  activeType === type ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600 mb-3">
            Showing {activeItems.length} {activeType} entries
          </div>

          <div className="space-y-3">
            {activeItems.length === 0 ? (
              <div className="text-sm text-gray-500">No entries loaded for this type.</div>
            ) : (
              activeItems.map((item, index) => (
                <pre key={item.id || `${activeType}-${index}`} className="bg-gray-50 border rounded p-3 text-xs overflow-x-auto">
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
