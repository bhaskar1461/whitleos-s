import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenShell } from "@/components/ScreenShell";
import { StatCard } from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { theme } from "@/lib/theme";
import type { JournalEntry, MealEntry, StepEntry, WorkoutEntry } from "@/lib/types";

function getBestStreak(entries: StepEntry[]) {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let best = 0;
  let current = 0;
  let previous: Date | null = null;

  for (const entry of sorted) {
    const date = new Date(entry.date);
    if (!previous) {
      current = 1;
      best = 1;
      previous = date;
      continue;
    }

    const diff = (previous.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    current = diff === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  }

  return best;
}

export default function ProgressScreen() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [steps, setSteps] = useState<StepEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAll() {
      try {
        const [mealData, workoutData, stepData, journalData] = await Promise.all([
          apiFetch<{ items: MealEntry[] }>("/api/meals"),
          apiFetch<{ items: WorkoutEntry[] }>("/api/workouts"),
          apiFetch<{ items: StepEntry[] }>("/api/steps"),
          apiFetch<{ items: JournalEntry[] }>("/api/journal"),
        ]);

        if (active) {
          setMeals(mealData.items);
          setWorkouts(workoutData.items);
          setSteps(stepData.items);
          setJournals(journalData.items);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAll();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen label="Loading progress..." />;
  }

  const totalCalories = meals.reduce((sum, item) => sum + Number(item.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  const totalSteps = steps.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const streak = getBestStreak(steps);
  const momentumScore = Math.min(
    100,
    Math.round(totalCalories / 90 + totalDuration / 5 + totalSteps / 1500 + journals.length * 4)
  );

  return (
    <ScreenShell
      showBack
      title="Progress"
      subtitle="A premium snapshot of what your restored Whiteleo's tools are actually producing."
    >
      <GlassCard strong style={styles.heroCard}>
        <Text style={styles.eyebrow}>Command center</Text>
        <Text style={styles.heroValue}>{momentumScore}</Text>
        <Text style={styles.heroNote}>Momentum score built from intake, training, steps, and reflections.</Text>
      </GlassCard>

      <View style={styles.grid}>
        <StatCard label="Meal energy" value={`${formatNumber(totalCalories)} kcal`} note={`${meals.length} entries`} />
        <StatCard label="Workout time" value={`${formatNumber(totalDuration)} min`} note={`${workouts.length} sessions`} />
        <StatCard label="Steps" value={formatNumber(totalSteps)} note={`${steps.length} records`} />
        <StatCard label="Journal" value={journals.length} note="Reflection depth" accent />
      </View>

      <GlassCard style={styles.noteCard}>
        <Text style={styles.sectionTitle}>Coach note</Text>
        <Text style={styles.copy}>
          Use meals for intake, workouts for effort, steps for rhythm, and journal entries for context. That combination
          gives this mobile summary actual signal instead of decorative numbers.
        </Text>
        <Text style={styles.copy}>
          Best streak so far: <Text style={styles.copyAccent}>{streak} days</Text>
        </Text>
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 10,
  },
  eyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  heroValue: {
    color: theme.colors.neon,
    fontSize: 54,
    fontWeight: "900",
  },
  heroNote: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  noteCard: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  copy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 24,
  },
  copyAccent: {
    color: theme.colors.neon,
    fontWeight: "800",
  },
});
