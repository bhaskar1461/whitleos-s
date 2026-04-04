import { Alert, StyleSheet, Text } from "react-native";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { ScreenShell } from "@/components/ScreenShell";
import { apiFetch } from "@/lib/api";
import { theme } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";

export default function ContactScreen() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    try {
      await apiFetch<{ message: string }>("/api/contact", {
        method: "POST",
        body: {
          firstName,
          lastName,
          email,
          countryCode,
          phone,
          message,
        },
      });
      setSubmitted(true);
    } catch (error) {
      Alert.alert("Unable to send message", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenShell
      showBack
      title="Contact"
      subtitle="Support, launch partnerships, investor demos, and gym rollout coordination in one premium mobile flow."
    >
      <GlassCard style={styles.infoCard}>
        <Text style={styles.eyebrow}>Support desk</Text>
        <Text style={styles.sectionTitle}>Keep the support experience as sharp as the product.</Text>
        <Text style={styles.copy}>hello@whiteleos.com</Text>
        <Text style={styles.copy}>Response path: email first</Text>
      </GlassCard>

      <GlassCard strong style={styles.formCard}>
        {submitted ? (
          <>
            <Text style={styles.sectionTitle}>Thanks.</Text>
            <Text style={styles.copy}>
              Your message has been recorded. The mobile contact experience now uses the same Whiteleo's visual system as the rest of the app.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Send a message</Text>
            <Field label="First name" value={firstName} onChangeText={setFirstName} placeholder="Alex" />
            <Field label="Last name" value={lastName} onChangeText={setLastName} placeholder="Mercer" />
            <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="hello@whiteleos.com" />
            <Field label="Country code" value={countryCode} onChangeText={setCountryCode} placeholder="+1" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="9876543210" />
            <Field label="Message" value={message} onChangeText={setMessage} multiline placeholder="Tell us what you need." />
            <Button
              onPress={handleSubmit}
              disabled={
                submitting ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim() ||
                !phone.trim() ||
                !message.trim()
              }
            >
              Submit
            </Button>
          </>
        )}
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.neon,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  copy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 24,
  },
  formCard: {
    gap: 14,
  },
});
