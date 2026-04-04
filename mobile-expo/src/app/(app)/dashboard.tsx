import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { GlassCard } from "@/components/GlassCard";
import { PreferencesCard } from "@/components/PreferencesCard";
import { ScreenShell } from "@/components/ScreenShell";
import { StatCard } from "@/components/StatCard";
import { dashboardHighlights, workspaceLinks } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { theme } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";
import type { User } from "@/lib/types";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  if (!currentUser) {
    return null;
  }

  async function handleLogout() {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      Alert.alert("Unable to logout", error instanceof Error ? error.message : "Try again.");
    }
  }

  function handleUserSaved(nextUser: User) {
    setCurrentUser(nextUser);
    setUser(nextUser);
  }

  const availableLinks = workspaceLinks.filter(
    (item) => item.href !== "/admin" || currentUser.role === "admin"
  );

  return (
    <ScreenShell
      title={`Welcome back, ${currentUser.name}.`}
      subtitle="Your mobile control panel keeps launch access, machine unlock, restored tools, and drink defaults in one premium flow."
      rightAction={
        <Pressable onPress={handleLogout} style={styles.headerAction}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.text} />
        </Pressable>
      }
    >
      <GlassCard strong style={styles.heroCard}>
        <Text style={styles.eyebrow}>Member overview</Text>
        <Text style={styles.heroTitle}>Whiteleo's is ready when you are.</Text>
        <Text style={styles.heroCopy}>
          Your account is configured for smart machine unlock, precise recovery defaults, and premium gym rollout access.
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{currentUser.subscription.status}</Text>
        </View>
      </GlassCard>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statStrip}>
        {dashboardHighlights.map((item, index) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            accent={index === 1}
          />
        ))}
      </ScrollView>

      <GlassCard style={styles.identityCard}>
        <Text style={styles.eyebrow}>Access identity</Text>
        <View style={styles.identityRow}>
          <Text style={styles.identityLabel}>Email</Text>
          <Text style={styles.identityValue}>{currentUser.email}</Text>
        </View>
        <View style={styles.identityRow}>
          <Text style={styles.identityLabel}>Plan</Text>
          <Text style={styles.identityValue}>{currentUser.subscription.plan}</Text>
        </View>
        <View style={styles.identityRow}>
          <Text style={styles.identityLabel}>Joined</Text>
          <Text style={styles.identityValue}>{formatDate(currentUser.createdAt)}</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.linkCard}>
        <Text style={styles.eyebrow}>Workspace</Text>
        <Text style={styles.sectionTitle}>Restored tools, mobile first.</Text>
        <View style={styles.linkGrid}>
          {availableLinks.map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={styles.linkButton}
            >
              <Ionicons name={item.icon} size={18} color={theme.colors.neon} />
              <Text style={styles.linkLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <PreferencesCard user={currentUser} onSaved={handleUserSaved} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroCard: {
    gap: 14,
  },
  eyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
  },
  heroCopy: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.neonSoft,
  },
  statusText: {
    color: theme.colors.neon,
    fontSize: 13,
    fontWeight: "700",
  },
  statStrip: {
    gap: 12,
  },
  identityCard: {
    gap: 14,
  },
  identityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  identityLabel: {
    color: theme.colors.textSoft,
    fontSize: 14,
  },
  identityValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  linkCard: {
    gap: 14,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  linkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  linkButton: {
    minWidth: "47%",
    flexGrow: 1,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 10,
  },
  linkLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
