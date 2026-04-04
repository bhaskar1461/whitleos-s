import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";

export function LoadingScreen({ label = "Loading Whiteloo..." }: { label?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.ring} />
      <ActivityIndicator color={theme.colors.neon} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  ring: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(182,255,0,0.08)",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
});
