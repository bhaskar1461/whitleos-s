import { Alert, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenShell } from "@/components/ScreenShell";
import { apiFetch } from "@/lib/api";
import { todayIso } from "@/lib/format";
import { theme } from "@/lib/theme";
import type { JournalEntry } from "@/lib/types";

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      try {
        const response = await apiFetch<{ items: JournalEntry[] }>("/api/journal");
        if (active) {
          setEntries(response.items);
        }
      } catch (error) {
        Alert.alert("Unable to load journal", error instanceof Error ? error.message : "Try again.");
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
    return <LoadingScreen label="Loading journal..." />;
  }

  async function handleSubmit() {
    setSaving(true);

    try {
      const response = await apiFetch<{ item: JournalEntry }>("/api/journal", {
        method: "POST",
        body: {
          title,
          content,
          date,
        },
      });
      setEntries((current) => [response.item, ...current]);
      setTitle("");
      setContent("");
      setDate(todayIso());
    } catch (error) {
      Alert.alert("Unable to save reflection", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      await apiFetch<{ message: string }>(`/api/journal/${id}`, { method: "DELETE" });
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      Alert.alert("Unable to delete reflection", error instanceof Error ? error.message : "Try again.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <ScreenShell
      showBack
      title="Journal"
      subtitle="Reflection is part of the product again, without losing the premium Whiteleo's visual tone."
    >
      <GlassCard strong style={styles.formCard}>
        <Text style={styles.sectionTitle}>Write today's reflection</Text>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="Recovery felt sharp" />
        <Field
          label="Reflection"
          value={content}
          onChangeText={setContent}
          placeholder="Write what happened, what changed, and what to keep."
          multiline
        />
        <Field label="Date" value={date} onChangeText={setDate} helper="Use YYYY-MM-DD" />
        <Button onPress={handleSubmit} disabled={saving || !title.trim() || !content.trim()}>
          Save Reflection
        </Button>
      </GlassCard>

      <GlassCard style={styles.listCard}>
        <Text style={styles.sectionTitle}>Journal archive</Text>
        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No journal entries yet.</Text>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHead}>
                <View style={styles.rowMain}>
                  <Text style={styles.itemTitle}>{entry.title}</Text>
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
              <Text style={styles.entryCopy}>{entry.content}</Text>
            </View>
          ))
        )}
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  entryCard: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  entryHead: {
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
  entryCopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 24,
  },
  inlineButton: {
    minWidth: 92,
  },
});
