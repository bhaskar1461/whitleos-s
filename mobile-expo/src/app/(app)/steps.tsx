import { Alert, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenShell } from "@/components/ScreenShell";
import { StatCard } from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { formatNumber, todayIso } from "@/lib/format";
import { theme } from "@/lib/theme";
import type { StepEntry } from "@/lib/types";

function getStreak(entries: StepEntry[]) {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  let previous: Date | null = null;

  for (const entry of sorted) {
    const current = new Date(entry.date);
    if (!previous) {
      streak = 1;
      previous = current;
      continue;
    }

    const diff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak += 1;
      previous = current;
    } else {
      break;
    }
  }

  return streak;
}

export default function StepsScreen() {
  const [entries, setEntries] = useState<StepEntry[]>([]);
  const [count, setCount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      try {
        const response = await apiFetch<{ items: StepEntry[] }>("/api/steps");
        if (active) {
          setEntries(response.items);
        }
      } catch (error) {
        Alert.alert("Unable to load steps", error instanceof Error ? error.message : "Try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen label="Loading steps..." />;
  }

  const totalSteps = entries.reduce((sum, entry) => sum + Number(entry.count || 0), 0);
  const streak = getStreak(entries);

  async function handleSubmit() {
    setSaving(true);

    try {
      const response = await apiFetch<{ item: StepEntry }>("/api/steps", {
        method: "POST",
        body: {
          count: Number(count) || 0,
          date,
        },
      });
      setEntries((current) => [response.item, ...current]);
      setCount("");
      setDate(todayIso());
    } catch (error) {
      Alert.alert("Unable to save steps", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      await apiFetch<{ message: string }>(`/api/steps/${id}`, { method: "DELETE" });
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      Alert.alert("Unable to delete step entry", error instanceof Error ? error.message : "Try again.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <ScreenShell
      showBack
      title="Steps"
      subtitle="Track movement in the same premium Whiteleo's interface language as the rest of the app."
    >
      <View style={styles.statRow}>
        <StatCard label="Current streak" value={streak} note="Consecutive logged days" accent />
        <StatCard label="Total steps" value={formatNumber(totalSteps)} note={`${entries.length} records`} />
      </View>

      <GlassCard strong style={styles.formCard}>
        <Text style={styles.sectionTitle}>Capture a step record</Text>
        <Field label="Step count" value={count} onChangeText={setCount} placeholder="12345" keyboardType="numeric" />
        <Field label="Date" value={date} onChangeText={setDate} helper="Use YYYY-MM-DD" />
        <Button onPress={handleSubmit} disabled={saving || !(Number(count) > 0)}>
          Add Steps
        </Button>
      </GlassCard>

      <GlassCard style={styles.listCard}>
        <Text style={styles.sectionTitle}>Movement timeline</Text>
        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No step records yet.</Text>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.listRow}>
              <View style={styles.rowMain}>
                <Text style={styles.itemTitle}>{formatNumber(entry.count)} steps</Text>
                <Text style={styles.itemMeta}>{entry.date}</Text>
              </View>
              <Button
                variant="ghost"
                style={styles.inlineButton}
                onPress={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
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
  inlineButton: {
    minWidth: 92,
  },
});
