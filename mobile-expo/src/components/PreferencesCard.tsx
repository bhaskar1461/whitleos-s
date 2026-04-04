import { Alert, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { ChoiceChips } from "@/components/ChoiceChips";
import { GlassCard } from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";
import { defaultPreferences, preferenceOptions } from "@/lib/site";
import { theme } from "@/lib/theme";
import type { User, UserPreferences } from "@/lib/types";

type PreferencesCardProps = {
  user: User;
  onSaved: (user: User) => void;
};

export function PreferencesCard({ user, onSaved }: PreferencesCardProps) {
  const [form, setForm] = useState<UserPreferences>(user.preferences || defaultPreferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(user.preferences || defaultPreferences);
  }, [user]);

  async function handleSave() {
    setSaving(true);

    try {
      const response = await apiFetch<{ user: User; message: string }>("/api/user/preferences", {
        method: "PUT",
        body: form,
      });
      onSaved(response.user);
    } catch (error) {
      Alert.alert("Unable to save", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard strong style={styles.card}>
      <Text style={styles.eyebrow}>Preferred drink settings</Text>
      <Text style={styles.title}>Tune your default pour.</Text>

      <View style={styles.options}>
        <ChoiceChips
          label="Blend"
          options={preferenceOptions.blend}
          value={form.blend}
          onChange={(value) => setForm((current) => ({ ...current, blend: String(value) }))}
        />
        <ChoiceChips
          label="Protein"
          options={preferenceOptions.protein}
          value={form.protein}
          onChange={(value) => setForm((current) => ({ ...current, protein: String(value) }))}
        />
        <ChoiceChips
          label="Liquid base"
          options={preferenceOptions.liquidBase}
          value={form.liquidBase}
          onChange={(value) => setForm((current) => ({ ...current, liquidBase: String(value) }))}
        />
        <ChoiceChips
          label="Temperature"
          options={preferenceOptions.temperature}
          value={form.temperature}
          onChange={(value) => setForm((current) => ({ ...current, temperature: String(value) }))}
        />
        <ChoiceChips
          label="Sweetness"
          options={preferenceOptions.sweetness}
          value={form.sweetness}
          onChange={(value) => setForm((current) => ({ ...current, sweetness: String(value) }))}
        />
        <ChoiceChips
          label="Pickup mode"
          options={preferenceOptions.pickupMode}
          value={form.pickupMode}
          onChange={(value) => setForm((current) => ({ ...current, pickupMode: String(value) }))}
        />
        <ChoiceChips
          label="Boosters"
          options={preferenceOptions.boosters}
          value={form.boosters}
          multiple
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              boosters: Array.isArray(value) ? value : current.boosters,
            }))
          }
        />
      </View>

      <Button onPress={handleSave} disabled={saving}>
        Save Preferences
      </Button>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  eyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  options: {
    gap: 18,
  },
});
