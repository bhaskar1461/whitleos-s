import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { ScreenShell } from "@/components/ScreenShell";
import { authBenefits } from "@/lib/site";
import { theme } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";

type AuthScreenProps = {
  mode: "login" | "signup";
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const { user, loading, login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  if (!loading && user) {
    return <Redirect href={user.role === "admin" ? "/admin" : "/dashboard"} />;
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      const nextUser = isSignup
        ? await signup({ name, email, password })
        : await login({ email, password });

      router.replace(nextUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      Alert.alert("Authentication failed", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenShell
      showBack
      title={isSignup ? "Create your Whiteleo's access profile." : "Return to your recovery dashboard."}
      subtitle="The mobile app shares the same premium backend, admin logic, and performance tooling as the web platform."
    >
      <GlassCard style={styles.benefitCard}>
        <Text style={styles.eyebrow}>Premium launch console</Text>
        {authBenefits.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Ionicons name="sparkles-outline" size={18} color={theme.colors.neon} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard strong style={styles.formCard}>
        <Text style={styles.formTitle}>
          {isSignup ? "Be first. Get access." : "Welcome back to Whiteleo's."}
        </Text>

        <View style={styles.formFields}>
          {isSignup ? (
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Alex Mercer"
              autoCapitalize="words"
            />
          ) : null}
          <Field
            label={isSignup ? "Email" : "Email or admin ID"}
            value={email}
            onChangeText={setEmail}
            placeholder={isSignup ? "hello@whiteleos.com" : "hello@whiteleos.com or admin@123"}
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />
        </View>

        <Button onPress={handleSubmit} disabled={submitting}>
          {isSignup ? "Create Account" : "Login"}
        </Button>

        <Button
          variant="ghost"
          onPress={() => router.replace(isSignup ? "/login" : "/signup")}
        >
          {isSignup ? "Already have access? Login" : "New to Whiteleo's? Sign up"}
        </Button>
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  benefitCard: {
    gap: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  benefitText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  formCard: {
    gap: 18,
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
  },
  formFields: {
    gap: 14,
  },
});
