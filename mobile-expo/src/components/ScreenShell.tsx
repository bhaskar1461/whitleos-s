import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, ReactNode } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";

import { theme } from "@/lib/theme";

type ScreenShellProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function ScreenShell({
  title,
  subtitle,
  showBack = false,
  rightAction,
  contentStyle,
  children,
}: ScreenShellProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </Pressable>
          ) : (
            <View style={styles.topSpacer} />
          )}

          {rightAction || <View style={styles.topSpacer} />}
        </View>

        {title ? (
          <View style={styles.heroBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
  },
  glowTop: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(182,255,0,0.12)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -160,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  topRow: {
    minHeight: 52,
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  topSpacer: {
    width: 44,
    height: 44,
  },
  heroBlock: {
    gap: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
});
