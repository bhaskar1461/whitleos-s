"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { WorkspaceHeader } from "@/components/workspace-header";
import { apiFetch } from "@/lib/api";
import { DISH_CATEGORIES, INDIAN_DISHES } from "@/data/indianDishes";

export function MealPlanView({ user, initialMeals }) {
  const [meals, setMeals] = useState(initialMeals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState(1);
  const [customDishName, setCustomDishName] = useState("");
  const [customDishCalories, setCustomDishCalories] = useState("");
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const filteredDishes = useMemo(() => {
    return INDIAN_DISHES.filter((dish) => {
      const categoryMatches = selectedCategory === "All" || dish.category === selectedCategory;
      const searchMatches =
        !searchQuery.trim() || dish.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return categoryMatches && searchMatches;
    });
  }, [searchQuery, selectedCategory]);

  const mealsForDate = useMemo(
    () => meals.filter((meal) => meal.date === selectedDate),
    [meals, selectedDate]
  );

  const totalCaloriesForDate = mealsForDate.reduce(
    (sum, meal) => sum + Number(meal.calories || 0),
    0
  );
  const totalCaloriesOverall = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);

  async function addMeal(payload, key) {
    setSavingId(key);
    try {
      const response = await apiFetch("/api/meals", {
        method: "POST",
        body: payload,
      });

      setMeals((current) => [response.item, ...current]);
      toast.success("Meal saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save meal.");
    } finally {
      setSavingId("");
    }
  }

  async function handleAddDish(dish) {
    const safeQuantity = Number.isFinite(Number(quantity)) ? Math.max(1, Number(quantity)) : 1;
    await addMeal(
      {
        name: dish.name,
        category: dish.category,
        calories: dish.calories * safeQuantity,
        baseCalories: dish.calories,
        quantity: safeQuantity,
        serving: safeQuantity === 1 ? dish.serving : `${safeQuantity} x ${dish.serving}`,
        date: selectedDate,
      },
      dish.id
    );
  }

  async function handleAddCustomDish(event) {
    event.preventDefault();

    const calories = Number(customDishCalories);
    if (!customDishName.trim() || !Number.isFinite(calories) || calories <= 0) {
      toast.error("Enter a valid custom dish and calories.");
      return;
    }

    await addMeal(
      {
        name: customDishName.trim(),
        category: "Custom",
        calories,
        baseCalories: calories,
        quantity: 1,
        serving: "1 serving",
        date: selectedDate,
      },
      "custom"
    );

    setCustomDishName("");
    setCustomDishCalories("");
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/meals/${id}`, { method: "DELETE" });
      setMeals((current) => current.filter((meal) => meal.id !== id));
      toast.success("Meal deleted.");
    } catch (error) {
      toast.error(error.message || "Unable to delete meal.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="grid-shell py-8 sm:py-10">
      <WorkspaceHeader
        user={user}
        title="Meal Plan"
        subtitle="Bring the old meal workspace back with a premium Whiteloo treatment."
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="eyebrow">Nutrition library</div>
              <h1 className="mt-3 font-display text-4xl font-semibold text-white">Curated meals, cleaner logging.</h1>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search dish"
                className="field h-11 sm:col-span-2"
              />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="field h-11"
              >
                {DISH_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-black text-white">
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="field h-11"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Dishes</div>
              <div className="mt-3 text-3xl font-semibold text-white">{filteredDishes.length}</div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Selected date</div>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="field mt-3 h-11 w-full"
              />
            </div>
            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Calories today</div>
              <div className="mt-3 text-3xl font-semibold text-neon">{totalCaloriesForDate} kcal</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredDishes.slice(0, 18).map((dish) => (
              <article key={dish.id} className="panel-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{dish.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/35">
                      {dish.category}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddDish(dish)}
                    disabled={savingId === dish.id}
                    className="neon-button px-4 py-2 text-xs"
                  >
                    {savingId === dish.id ? "Adding..." : "Add"}
                  </button>
                </div>
                <div className="mt-4 text-sm text-white/55">{dish.serving}</div>
                <div className="mt-2 text-sm font-medium text-neon">{dish.calories} kcal</div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="panel-strong p-5">
            <div className="eyebrow">Custom meal</div>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">Add your own dish.</h2>
            <form onSubmit={handleAddCustomDish} className="mt-5 space-y-3">
              <input
                value={customDishName}
                onChange={(event) => setCustomDishName(event.target.value)}
                placeholder="Dish name"
                className="field h-12 w-full"
              />
              <input
                type="number"
                min="1"
                value={customDishCalories}
                onChange={(event) => setCustomDishCalories(event.target.value)}
                placeholder="Calories"
                className="field h-12 w-full"
              />
              <button type="submit" className="neon-button justify-center" disabled={savingId === "custom"}>
                {savingId === "custom" ? "Saving..." : "Add Custom Meal"}
              </button>
            </form>
          </div>

          <div className="panel p-5">
            <div className="eyebrow">Meal log</div>
            <div className="mt-3 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-white">{selectedDate}</h2>
              <div className="text-sm text-white/45">{totalCaloriesOverall} kcal total</div>
            </div>

            <div className="mt-5 space-y-3">
              {mealsForDate.length === 0 ? (
                <div className="panel-muted px-4 py-8 text-center text-sm text-white/45">
                  No meals saved for this date yet.
                </div>
              ) : (
                mealsForDate.map((meal) => (
                  <div key={meal.id} className="panel-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-white">{meal.name}</div>
                        <div className="mt-1 text-sm text-white/45">{meal.serving || "1 serving"}</div>
                        <div className="mt-2 text-sm text-neon">{meal.calories} kcal</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(meal.id)}
                        disabled={deletingId === meal.id}
                        className="text-sm text-red-200 transition hover:text-red-100"
                      >
                        {deletingId === meal.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
