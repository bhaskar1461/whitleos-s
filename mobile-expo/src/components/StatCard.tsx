import { StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { theme } from "@/lib/theme";

type StatCardProps = {
  label: string;
  value: string | number;
  note?: string;
  accent?: boolean;
};

export function StatCard({ label, value, note, accent = false }: StatCardProps) {
  return (
    <GlassCard strong style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? styles.accentValue : null]}>{value}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : <View style={styles.noteGap} />}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    gap: 10,
  },
  label: {
    color: theme.colors.textFaint,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontWeight: "700",
  },
  value: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  accentValue: {
    color: theme.colors.neon,
  },
  note: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  noteGap: {
    height: 20,
  },
});
