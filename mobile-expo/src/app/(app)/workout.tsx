import { Alert, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenShell } from "@/components/ScreenShell";
import { StatCard } from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { todayIso } from "@/lib/format";
import { theme } from "@/lib/theme";
import type { WorkoutEntry } from "@/lib/types";

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [exercise, setExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWorkouts() {
      try {
        const response = await apiFetch<{ items: WorkoutEntry[] }>("/api/workouts");
        if (active) {
          setWorkouts(response.items);
        }
      } catch (error) {
        Alert.alert("Unable to load workouts", error instanceof Error ? error.message : "Try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadWorkouts();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen label="Loading workouts..." />;
  }

  const totalDuration = workouts.reduce((sum, item) => sum + Number(item.duration || 0), 0);

  async function handleSubmit() {
    setSaving(true);

    try {
      const response = await apiFetch<{ item: WorkoutEntry }>("/api/workouts", {
        method: "POST",
        body: {
          exercise,
          duration: Number(duration) || 0,
          date,
        },
      });
      setWorkouts((current) => [response.item, ...current]);
      setExercise("");
      setDuration("");
      setDate(todayIso());
    } catch (error) {
      Alert.alert("Unable to save workout", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      await apiFetch<{ message: string }>(`/api/workouts/${id}`, { method: "DELETE" });
      setWorkouts((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      Alert.alert("Unable to delete workout", error instanceof Error ? error.message : "Try again.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <ScreenShell
      showBack
      title="Workout"
      subtitle="Manual session logging is back, now tuned for a cleaner mobile workflow."
    >
      <View style={styles.statRow}>
        <StatCard label="Sessions" value={workouts.length} note="Logged training blocks" />
        <StatCard label="Total duration" value={`${totalDuration} min`} note="Across all sessions" accent />
      </View>

      <GlassCard strong style={styles.formCard}>
        <Text style={styles.sectionTitle}>Log a training session</Text>
        <Field label="Exercise or session name" value={exercise} onChangeText={setExercise} placeholder="Strength Circuit" />
        <Field label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="45" />
        <Field label="Date" value={date} onChangeText={setDate} helper="Use YYYY-MM-DD" />
        <Button onPress={handleSubmit} disabled={saving || !exercise.trim() || !(Number(duration) > 0)}>
          Add Workout
        </Button>
      </GlassCard>

      <GlassCard style={styles.listCard}>
        <Text style={styles.sectionTitle}>Workout timeline</Text>
        {workouts.length === 0 ? (
          <Text style={styles.emptyText}>No workouts logged yet.</Text>
        ) : (
          workouts.map((workout) => (
            <View key={workout.id} style={styles.listRow}>
              <View style={styles.rowMain}>
                <Text style={styles.itemTitle}>{workout.exercise}</Text>
                <Text style={styles.itemMeta}>{workout.date}</Text>
                <Text style={styles.itemAccent}>{workout.duration} min</Text>
              </View>
              <Button
                variant="ghost"
                style={styles.inlineButton}
                onPress={() => handleDelete(workout.id)}
                disabled={deletingId === workout.id}
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
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  formCard: {
    gap: 14,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  listCard: {
    gap: 14,
  },
  emptyText: {
    color: theme.colors.textSoft,
    fontSize: 14,
  },
  listRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
});
