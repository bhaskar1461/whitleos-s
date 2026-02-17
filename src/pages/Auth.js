import React, { useEffect, useState } from 'react';

function Auth() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [providerConfig, setProviderConfig] = useState(null);
  const backendOrigin = process.env.REACT_APP_BACKEND_ORIGIN || `${window.location.protocol}//${window.location.hostname}:4000`;

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user', { credentials: 'include' });
      const data = await res.json();
      setUser(data.user);
    } catch (_e) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => setProviderConfig(data))
      .catch(() => setProviderConfig(null));
  }, []);

  const handleGitHubLogin = () => {
    if (providerConfig && !providerConfig.github?.configured) {
      setMessage('GitHub login is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.');
      return;
    }
    window.location.href = `${backendOrigin}/auth/github`;
  };

  const handleGoogleLogin = () => {
    if (providerConfig && !providerConfig.google?.configured) {
      setMessage('Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
      return;
    }
    window.location.href = `${backendOrigin}/auth/google`;
  };

  const handleAppleInfo = () => {
    setMessage('Apple Health sync requires an iOS HealthKit bridge app. Web login alone cannot fetch Apple Health data.');
  };

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          {user.avatar ? <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full mb-3 mx-auto" /> : null}
          <h2 className="text-2xl font-semibold">Welcome, {user.username}</h2>
          <div className="text-sm text-gray-500 mt-2">Signed in via {user.provider || 'oauth'}</div>
          <button onClick={handleLogout} className="mt-6 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
            Logout
          </button>
          <div className="text-xs text-gray-500 mt-4">
            For Google Fit sync, sign in with Google and use the Sync button on Steps or Program pages.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Sign in</h2>
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={providerConfig ? !providerConfig.google?.configured : false}
          >
            Continue with Google (Gmail)
          </button>
          <button
            onClick={handleGitHubLogin}
            className="w-full bg-gray-900 text-white py-2 rounded hover:bg-black disabled:opacity-50"
            disabled={providerConfig ? !providerConfig.github?.configured : false}
          >
            Continue with GitHub
          </button>
          <button onClick={handleAppleInfo} className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
            Continue with Apple ID
          </button>
        </div>
        {message ? <div className="text-xs text-amber-700 mt-4">{message}</div> : null}
        <div className="text-xs text-gray-500 mt-4">
          Zepp data can be synced by connecting Zepp app to Google Fit, then syncing here.
        </div>
      </div>
    </div>
  );
}

export default Auth;
