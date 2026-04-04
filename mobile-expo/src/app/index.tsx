import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { HeroMachine } from "@/components/HeroMachine";
import { ScreenShell } from "@/components/ScreenShell";
import { apiFetch } from "@/lib/api";
import { launchCities, precisionFeatures } from "@/lib/site";
import { theme } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";

export default function LandingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleWaitlist() {
    setSubmitting(true);

    try {
      const response = await apiFetch<{ message: string }>("/api/waitlist", {
        method: "POST",
        body: { email },
      });
      Alert.alert("Success", response.message);
      setEmail("");
    } catch (error) {
      Alert.alert("Unable to join", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenShell>
      <View style={styles.navRow}>
        <Text style={styles.brand}>Whiteleo's</Text>
        <Pressable onPress={() => router.push(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login")}>
          <Text style={styles.navLink}>{user ? "Open app" : "Login"}</Text>
        </Pressable>
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.heroEyebrow}>Premium post-workout automation</Text>
        <Text style={styles.heroTitle}>Don't make protein.{"\n"}<Text style={styles.heroAccent}>Just drink it.</Text></Text>
        <Text style={styles.heroCopy}>
          Fresh protein shakes in 2 minutes through smart gym machines designed with the same discipline as a luxury hardware product.
        </Text>
        <View style={styles.heroActions}>
          <Button onPress={() => router.push("/signup")}>Join Waitlist</Button>
          <Button variant="ghost" onPress={() => router.push(user ? "/dashboard" : "/login")}>
            {user ? "Open Dashboard" : "Member Login"}
          </Button>
        </View>
      </View>

      <HeroMachine />

      <View style={styles.statRow}>
        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Launch wave</Text>
          <Text style={styles.statValue}>01</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Pour time</Text>
          <Text style={[styles.statValue, styles.statAccent]}>2m</Text>
        </GlassCard>
      </View>

      <GlassCard strong style={styles.waitlistCard}>
        <Text style={styles.sectionEyebrow}>Be first. Get access.</Text>
        <Text style={styles.sectionTitle}>Reserve your launch update.</Text>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Button onPress={handleWaitlist} disabled={submitting}>
          Join Waitlist
        </Button>
      </GlassCard>

      <View style={styles.featureGroup}>
        <Text style={styles.sectionEyebrow}>Kinetic Precision</Text>
        <Text style={styles.sectionTitle}>A ritual designed to disappear into motion.</Text>
        <View style={styles.featureStack}>
          {precisionFeatures.map((feature) => (
            <GlassCard key={feature.title} style={styles.featureCard}>
              <Ionicons name={feature.icon} size={22} color={theme.colors.neon} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureCopy}>{feature.description}</Text>
            </GlassCard>
          ))}
        </View>
      </View>

      <GlassCard style={styles.cityCard}>
        <Text style={styles.sectionEyebrow}>Launching soon in premium gyms</Text>
        <View style={styles.cityRow}>
          {launchCities.map((city) => (
            <View key={city} style={styles.cityChip}>
              <Text style={styles.cityText}>{city}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  navRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  navLink: {
    color: theme.colors.neon,
    fontSize: 15,
    fontWeight: "700",
  },
  heroBlock: {
    gap: 14,
  },
  heroEyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "900",
  },
  heroAccent: {
    color: theme.colors.neon,
  },
  heroCopy: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 25,
    maxWidth: 620,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
    justifyContent: "space-between",
  },
  statLabel: {
    color: theme.colors.textFaint,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontWeight: "700",
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: "900",
  },
  statAccent: {
    color: theme.colors.neon,
  },
  waitlistCard: {
    gap: 14,
  },
  sectionEyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
  },
  featureGroup: {
    gap: 14,
  },
  featureStack: {
    gap: 12,
  },
  featureCard: {
    gap: 12,
  },
  featureTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "700",
  },
  featureCopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  cityCard: {
    gap: 14,
  },
  cityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cityChip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cityText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
