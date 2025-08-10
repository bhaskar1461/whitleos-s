import React from 'react';

function MealPlan() {
  return (
    <div className="min-h-screen bg-[#121214] text-gray-200 flex items-center justify-center px-6">
      <div className="max-w-3xl w-full bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-10 text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-white">Meal Plan</h2>
        <p className="text-gray-300 leading-7">
          Log your meals, view your meal history, and create plans based on your workout goals. This section can be
          connected to your preferred nutrition API or used as a simple tracker.
        </p>
      </div>
    </div>
  );
}

export default MealPlan; 