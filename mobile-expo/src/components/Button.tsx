import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { PropsWithChildren } from "react";

import { theme } from "@/lib/theme";

type ButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  style?: ViewStyle;
}>;

export function Button({
  children,
  onPress,
  disabled = false,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.ghost,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {disabled ? (
        <ActivityIndicator color={variant === "primary" ? "#050505" : theme.colors.neon} />
      ) : (
        <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.ghostLabel]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primary: {
    backgroundColor: theme.colors.neon,
    borderColor: theme.colors.neon,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: theme.colors.border,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: "#050505",
  },
  ghostLabel: {
    color: theme.colors.text,
  },
});
