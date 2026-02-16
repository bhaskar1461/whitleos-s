import React, { useEffect, useState } from 'react';

function Auth() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/user', { credentials: 'include' });
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/github';
  };

  const handleLogout = async () => {
    await fetch('http://localhost:4000/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full mb-3" />
        <h2 className="text-2xl font-semibold">Welcome, {user.username}</h2>
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-6 py-2 rounded">Logout</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Sign in</h2>
        <button onClick={handleLogin} className="w-full bg-gray-900 text-white py-2 rounded hover:bg-black">
          Continue with GitHub
        </button>
        <div className="text-xs text-gray-500 mt-4">We use GitHub OAuth; no passwords stored.</div>
      </div>
    </div>
  );
}

export default Auth; 