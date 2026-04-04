import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenShell } from "@/components/ScreenShell";
import { apiFetch } from "@/lib/api";
import { todayIso } from "@/lib/format";
import { DISH_CATEGORIES, INDIAN_DISHES } from "@/lib/indianDishes";
import { theme } from "@/lib/theme";
import type { MealEntry } from "@/lib/types";

export default function MealPlanScreen() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMeals() {
      try {
        const response = await apiFetch<{ items: MealEntry[] }>("/api/meals");
        if (active) {
          setMeals(response.items);
        }
      } catch (error) {
        Alert.alert("Unable to load meals", error instanceof Error ? error.message : "Try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMeals();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen label="Loading meal plan..." />;
  }

  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const filteredDishes = INDIAN_DISHES.filter((dish) => {
    const matchesCategory = selectedCategory === "All" || dish.category === selectedCategory;
    const matchesSearch =
      !search.trim() || dish.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const mealsForDate = meals.filter((meal) => meal.date === selectedDate);
  const totalCalories = mealsForDate.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);

  async function addMeal(payload: Omit<MealEntry, "id" | "createdAt" | "updatedAt">) {
    setSaving(true);

    try {
      const response = await apiFetch<{ item: MealEntry; message: string }>("/api/meals", {
        method: "POST",
        body: payload,
      });
      setMeals((current) => [response.item, ...current]);
    } catch (error) {
      Alert.alert("Unable to save meal", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      await apiFetch<{ message: string }>(`/api/meals/${id}`, { method: "DELETE" });
      setMeals((current) => current.filter((meal) => meal.id !== id));
    } catch (error) {
      Alert.alert("Unable to delete meal", error instanceof Error ? error.message : "Try again.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <ScreenShell
      showBack
      title="Meal Plan"
      subtitle="Restore the meal workspace in a mobile flow built for quick logging and premium visual calm."
    >
      <GlassCard strong style={styles.summaryCard}>
        <Text style={styles.eyebrow}>Nutrition library</Text>
        <Text style={styles.summaryValue}>{totalCalories} kcal</Text>
        <Text style={styles.summaryNote}>{mealsForDate.length} meals logged for {selectedDate}</Text>
      </GlassCard>

      <GlassCard style={styles.filterCard}>
        <Field label="Search dish" value={search} onChangeText={setSearch} placeholder="Paneer, biryani, dosa..." />
        <Field label="Date" value={selectedDate} onChangeText={setSelectedDate} helper="Use YYYY-MM-DD" />
        <Field label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {DISH_CATEGORIES.map((category) => {
            const active = category === selectedCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.chip, active ? styles.activeChip : null]}
              >
                <Text style={[styles.chipText, active ? styles.activeChipText : null]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </GlassCard>

      <GlassCard style={styles.customCard}>
        <Text style={styles.sectionTitle}>Add custom dish</Text>
        <Field label="Dish name" value={customName} onChangeText={setCustomName} placeholder="Protein bowl" />
        <Field
          label="Calories"
          value={customCalories}
          onChangeText={setCustomCalories}
          placeholder="520"
          keyboardType="numeric"
        />
        <Button
          onPress={() =>
            addMeal({
              name: customName,
              category: "Custom",
              calories: Number(customCalories) || 0,
              baseCalories: Number(customCalories) || 0,
              quantity: 1,
              serving: "1 serving",
              date: selectedDate,
            })
          }
          disabled={saving || !customName.trim() || !(Number(customCalories) > 0)}
        >
          Add Custom Meal
        </Button>
      </GlassCard>

      <View style={styles.stack}>
        {filteredDishes.map((dish) => (
          <GlassCard key={dish.id} style={styles.rowCard}>
            <View style={styles.rowBetween}>
              <View style={styles.rowMain}>
                <Text style={styles.itemTitle}>{dish.name}</Text>
                <Text style={styles.itemMeta}>{dish.category} · {dish.serving}</Text>
                <Text style={styles.itemAccent}>{dish.calories} kcal</Text>
              </View>
              <Button
                style={styles.inlineButton}
                onPress={() =>
                  addMeal({
                    name: dish.name,
                    category: dish.category,
                    calories: dish.calories * safeQuantity,
                    baseCalories: dish.calories,
                    quantity: safeQuantity,
                    serving: safeQuantity === 1 ? dish.serving : `${safeQuantity} x ${dish.serving}`,
                    date: selectedDate,
                  })
                }
                disabled={saving}
              >
                Add
              </Button>
            </View>
          </GlassCard>
        ))}
      </View>

      <GlassCard strong style={styles.logCard}>
        <Text style={styles.sectionTitle}>Meal log</Text>
        {mealsForDate.length === 0 ? (
          <Text style={styles.emptyText}>No meals logged for this date yet.</Text>
        ) : (
          mealsForDate.map((meal) => (
            <View key={meal.id} style={styles.loggedRow}>
              <View style={styles.rowMain}>
                <Text style={styles.itemTitle}>{meal.name}</Text>
                <Text style={styles.itemMeta}>{meal.serving || "1 serving"}</Text>
                <Text style={styles.itemAccent}>{meal.calories} kcal</Text>
              </View>
              <Button
                variant="ghost"
                style={styles.inlineButton}
                onPress={() => handleDelete(meal.id)}
                disabled={deletingId === meal.id}
              >
                Delete
              </Button>
            </View>
          ))
        )}
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 10,
  },
  eyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "800",
  },
  summaryNote: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  filterCard: {
    gap: 14,
  },
  chipRow: {
    gap: 10,
  },
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  activeChip: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.neonSoft,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  activeChipText: {
    color: theme.colors.neon,
  },
  customCard: {
    gap: 14,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  stack: {
    gap: 12,
  },
  rowCard: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  rowMain: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  itemMeta: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  itemAccent: {
    color: theme.colors.neon,
    fontSize: 14,
    fontWeight: "700",
  },
  inlineButton: {
    minWidth: 92,
  },
  logCard: {
    gap: 14,
  },
  emptyText: {
    color: theme.colors.textSoft,
    fontSize: 14,
  },
  loggedRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
