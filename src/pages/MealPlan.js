import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DISH_CATEGORIES, INDIAN_DISHES } from '../data/indianDishes';

function MealPlan() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [savingDishId, setSavingDishId] = useState('');
  const [deletingMealId, setDeletingMealId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState(1);
  const [customDishName, setCustomDishName] = useState('');
  const [customDishCalories, setCustomDishCalories] = useState('');

  const filteredDishes = useMemo(() => {
    return INDIAN_DISHES.filter((dish) => {
      const categoryMatches = selectedCategory === 'All' || dish.category === selectedCategory;
      const searchMatches =
        searchQuery.trim() === '' || dish.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return categoryMatches && searchMatches;
    });
  }, [searchQuery, selectedCategory]);

  const mealsForDate = useMemo(() => {
    return meals.filter((meal) => meal.date === selectedDate);
  }, [meals, selectedDate]);

  const totalCaloriesForDate = useMemo(() => {
    return mealsForDate.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  }, [mealsForDate]);

  const totalCaloriesOverall = useMemo(() => {
    return meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  }, [meals]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/meals', { credentials: 'include' });
      if (res.status === 401) {
        setIsUnauthorized(true);
        setMeals([]);
        return;
      }
      if (!res.ok) throw new Error('Unable to load meal history');
      const data = await res.json();
      setIsUnauthorized(false);
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const addDish = async (dish) => {
    if (isUnauthorized) {
      setError('Please login first to save meals.');
      return;
    }
    const safeQuantity = Number.isFinite(Number(quantity)) ? Math.max(1, Number(quantity)) : 1;
    const totalCalories = dish.calories * safeQuantity;
    const serving = safeQuantity === 1 ? dish.serving : `${safeQuantity} x ${dish.serving}`;

    try {
      setSavingDishId(dish.id);
      setError('');
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: dish.name,
          category: dish.category,
          calories: totalCalories,
          baseCalories: dish.calories,
          quantity: safeQuantity,
          serving,
          date: selectedDate,
          created: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Unable to add dish right now');
      await fetchMeals();
    } catch (err) {
      setError(err.message || 'Unable to add dish');
    } finally {
      setSavingDishId('');
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      setDeletingMealId(mealId);
      setError('');
      const res = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Unable to delete meal entry');
      await fetchMeals();
    } catch (err) {
      setError(err.message || 'Unable to delete meal');
    } finally {
      setDeletingMealId('');
    }
  };

  const addCustomDish = async (e) => {
    e.preventDefault();
    if (isUnauthorized) {
      setError('Please login first to save meals.');
      return;
    }
    const trimmedName = customDishName.trim();
    const caloriesValue = Number(customDishCalories);
    if (!trimmedName || !Number.isFinite(caloriesValue) || caloriesValue <= 0) {
      setError('Enter a valid custom dish name and calories.');
      return;
    }
    try {
      setError('');
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: trimmedName,
          category: 'Custom',
          calories: caloriesValue,
          baseCalories: caloriesValue,
          quantity: 1,
          serving: '1 serving',
          date: selectedDate,
          created: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Unable to add custom meal right now');
      setCustomDishName('');
      setCustomDishCalories('');
      await fetchMeals();
    } catch (err) {
      setError(err.message || 'Unable to add custom meal');
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] text-gray-200 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-3xl font-extrabold text-white">Indian Meal Plan</h2>
          <p className="text-gray-300 mt-3 leading-7">
            Preloaded with common Indian dishes and calorie values per standard serving. Filter dishes, set quantity and
            date, then add directly to your meal log.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Note: Calories are standard reference values and can vary with recipe, oil, and portion size.
          </p>
        </header>

        {isUnauthorized && (
          <div className="bg-yellow-500/10 border border-yellow-400/40 rounded-lg px-4 py-3 text-yellow-200">
            Login is required to save meals. Open <Link to="/auth" className="underline">Login</Link> and sign in with
            GitHub, then return here.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-400/40 rounded-lg px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish..."
                className="md:col-span-2 bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
              >
                {DISH_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="text-sm text-gray-400 mb-3">
              {filteredDishes.length} dishes found
            </div>

            <div className="max-h-[560px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDishes.map((dish) => (
                  <div key={dish.id} className="bg-[#111214] border border-gray-700/50 rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{dish.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{dish.category} | {dish.serving}</p>
                        <p className="text-lime-300 text-sm mt-2">{dish.calories} kcal</p>
                      </div>
                      <button
                        onClick={() => addDish(dish)}
                        disabled={savingDishId === dish.id}
                        className="bg-lime-400 text-gray-900 font-semibold px-3 py-1.5 rounded text-xs hover:bg-lime-300 disabled:opacity-60"
                      >
                        {savingDishId === dish.id ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#1a1b1c] border border-gray-700/40 rounded-lg p-5">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Meal date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111214] border border-gray-700/50 rounded p-3">
                  <div className="text-xs text-gray-400">Calories for date</div>
                  <div className="text-xl font-bold text-white mt-1">{totalCaloriesForDate} kcal</div>
                </div>
                <div className="bg-[#111214] border border-gray-700/50 rounded p-3">
                  <div className="text-xs text-gray-400">Overall calories</div>
                  <div className="text-xl font-bold text-white mt-1">{totalCaloriesOverall} kcal</div>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-700/40 pt-4">
              <h3 className="text-white font-semibold mb-3">Add Custom Dish</h3>
              <form onSubmit={addCustomDish} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
                <input
                  type="text"
                  value={customDishName}
                  onChange={(e) => setCustomDishName(e.target.value)}
                  placeholder="Dish name"
                  className="sm:col-span-2 bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  value={customDishCalories}
                  onChange={(e) => setCustomDishCalories(e.target.value)}
                  placeholder="Calories"
                  className="bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="sm:col-span-3 bg-blue-500/90 hover:bg-blue-400 text-white rounded px-3 py-2 text-sm font-semibold"
                >
                  Add Custom Meal
                </button>
              </form>

              <div className="border-t border-gray-700/40 pt-4">
              <h3 className="text-white font-semibold mb-3">Meal Log ({selectedDate})</h3>
              {loading ? (
                <p className="text-sm text-gray-400">Loading meals...</p>
              ) : mealsForDate.length === 0 ? (
                <p className="text-sm text-gray-400">No meals saved for this date.</p>
              ) : (
                <ul className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {mealsForDate.map((meal) => (
                    <li key={meal.id} className="bg-[#111214] border border-gray-700/50 rounded p-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-white">{meal.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{meal.serving || '1 serving'}</div>
                          <div className="text-xs text-lime-300 mt-1">{meal.calories} kcal</div>
                        </div>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          disabled={deletingMealId === meal.id}
                          className="text-red-300 hover:text-red-200 text-xs disabled:opacity-60"
                        >
                          {deletingMealId === meal.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MealPlan;
