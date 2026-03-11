import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, buildBackendUrl } from '../lib/api';

function Auth() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [providerConfig, setProviderConfig] = useState(null);
  const [providerStatusLoaded, setProviderStatusLoaded] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await apiFetch('/api/user');
      const data = await res.json();
      setUser(data.user);
    } catch (_e) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
    apiFetch('/api/auth/providers')
      .then((res) => {
        if (!res.ok) throw new Error(`providers_request_failed_${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProviderConfig(data);
        setProviderStatusLoaded(true);
      })
      .catch(() => {
        setProviderConfig(null);
        setProviderStatusLoaded(false);
      })
      .finally(() => setLoadingProviders(false));
  }, []);

  const handleGitHubLogin = () => {
    if (providerConfig && !providerConfig.github?.configured) {
      setMessage('GitHub login is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.');
      return;
    }
    window.location.href = buildBackendUrl('/auth/github');
  };

  const handleGoogleLogin = () => {
    if (providerConfig && !providerConfig.google?.configured) {
      setMessage('Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
      return;
    }
    window.location.href = buildBackendUrl('/auth/google');
  };

  const handleLogout = async () => {
    await apiFetch('/logout', { method: 'POST' });
    setUser(null);
  };

  if (user) {
    return (
      <div className="page-shell pt-2">
        <div className="site-shell">
          <div className="mx-auto max-w-xl glass-panel-strong rounded-[32px] p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{(user.username || 'U').slice(0, 1)}</span>
              )}
            </div>
            <div className="mt-6">
              <div className="pill">Signed in</div>
              <h2 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold text-white">Welcome back, {user.username}</h2>
              <div className="mt-3 text-sm uppercase tracking-[0.24em] text-slate-400">Provider: {user.provider || 'oauth'}</div>
            </div>
            <p className="mt-6 leading-7 text-slate-300">
              Your workspace is ready. If you signed in with Google, head to steps or workouts to sync from Google Fit.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
              <Link to="/progress" className="btn-primary">
                Open progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pt-2">
      <div className="site-shell">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="glass-panel-strong rounded-[32px] p-8 md:p-10">
            <div className="pill">Access your wellness workspace</div>
            <h1 className="mt-5 font-['Space_Grotesk'] text-4xl font-bold leading-tight text-white md:text-5xl">
              Sign in once. Track daily with less friction.
            </h1>
            <p className="mt-5 max-w-xl leading-8 text-slate-300">
              Use GitHub or Google to unlock meals, workouts, steps, journal entries, and progress summaries. Google
              login also enables Google Fit sync for movement data.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Login flow</div>
                <div className="mt-2 text-2xl font-bold text-white">OAuth</div>
                <div className="mt-2 text-sm text-slate-400">No local password system to manage.</div>
              </div>
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Google path</div>
                <div className="mt-2 text-2xl font-bold text-white">Fit sync</div>
                <div className="mt-2 text-sm text-slate-400">Bring in steps and workouts when configured.</div>
              </div>
              <div className="stat-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Session</div>
                <div className="mt-2 text-2xl font-bold text-white">Persistent</div>
                <div className="mt-2 text-sm text-slate-400">Stay signed in across your daily routine.</div>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[32px] p-8">
            <div className="text-sm uppercase tracking-[0.24em] text-sky-200">Choose provider</div>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold text-white">Continue into Whitleos</h2>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="field flex items-center justify-between px-5 py-4 text-left disabled:opacity-50"
                disabled={providerConfig ? !providerConfig.google?.configured : false}
              >
                <span>
                  <span className="block text-base font-semibold text-white">Continue with Google</span>
                  <span className="mt-1 block text-sm text-slate-400">Best choice if you want Google Fit sync.</span>
                </span>
                <span className="text-sky-200">{providerConfig?.google?.configured ? 'Ready' : 'Setup needed'}</span>
              </button>
              <button
                onClick={handleGitHubLogin}
                className="field flex items-center justify-between px-5 py-4 text-left disabled:opacity-50"
                disabled={providerConfig ? !providerConfig.github?.configured : false}
              >
                <span>
                  <span className="block text-base font-semibold text-white">Continue with GitHub</span>
                  <span className="mt-1 block text-sm text-slate-400">Fast path for standard sign-in and tracking.</span>
                </span>
                <span className="text-sky-200">{providerConfig?.github?.configured ? 'Ready' : 'Setup needed'}</span>
              </button>
            </div>
            <div className="mt-5 text-sm text-slate-400">
              {loadingProviders
                ? 'Checking provider availability...'
                : providerStatusLoaded
                ? 'Provider status loaded from the backend.'
                : 'Provider status could not be loaded. Check backend/API routing.'}
            </div>
            {message ? (
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                {message}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Auth;
