import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import MealPlan from './pages/MealPlan';
import Workout from './pages/Workout';
import Steps from './pages/Steps';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/mealplan', label: 'Meals' },
  { to: '/workout', label: 'Workouts' },
  { to: '/steps', label: 'Steps' },
  { to: '/journal', label: 'Journal' },
  { to: '/progress', label: 'Progress' },
  { to: '/contact', label: 'Contact' },
  { to: '/admin', label: 'Admin' },
];

function AppShell() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <div className="px-4 pt-4 md:px-8 md:pt-6">
        <div className="site-shell">
          <nav className="glass-panel sticky top-3 z-20 rounded-[28px] px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3" onClick={() => setMobileNavOpen(false)}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-lg font-black text-sky-700">
                  W
                </div>
                <div>
                    <div className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-slate-900">Whitleos</div>
                    <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Wellness workspace</div>
                </div>
              </Link>

              <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <Link to="/auth" className="btn-primary hidden px-5 py-2.5 text-sm sm:inline-flex">
                  Login
                </Link>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/80 text-slate-900 lg:hidden"
                  onClick={() => setMobileNavOpen((value) => !value)}
                  aria-label="Toggle navigation"
                  aria-expanded={mobileNavOpen}
                >
                  {mobileNavOpen ? 'X' : '='}
                </button>
              </div>
            </div>

            {mobileNavOpen ? (
              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:hidden">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileNavOpen(false)}
                      className={`rounded-2xl px-4 py-3 text-sm transition ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Link to="/auth" onClick={() => setMobileNavOpen(false)} className="btn-primary mt-2 justify-center sm:hidden">
                  Login
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mealplan" element={<MealPlan />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/steps" element={<Steps />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
