import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { theme } from "@/lib/theme";

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
}>;

export function GlassCard({ children, style, strong = false }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        strong ? styles.strongCard : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
    padding: theme.spacing.lg,
    overflow: "hidden",
  },
  strongCard: {
    backgroundColor: theme.colors.panelStrong,
    ...theme.shadow,
  },
});
