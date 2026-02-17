import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import MealPlan from './pages/MealPlan';
import Workout from './pages/Workout';
import Steps from './pages/Steps';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import Admin from './pages/Admin';



function App() {
  return (
    <Router>
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="font-bold text-xl">Fitness & Journal</div>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/mealplan" className="hover:underline">Meal Plan</Link>
          <Link to="/workout" className="hover:underline">Program</Link>
          <Link to="/steps" className="hover:underline">Steps</Link>
          <Link to="/journal" className="hover:underline">Journal</Link>
          <Link to="/progress" className="hover:underline">Progress</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/auth" className="hover:underline">Login</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </div>
      </nav>
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
    </Router>
  );
}

export default App; 
