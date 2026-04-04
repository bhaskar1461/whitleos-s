import { Alert, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GlassCard } from "@/components/GlassCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenShell } from "@/components/ScreenShell";
import { StatCard } from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { theme } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";
import type { AdminAnalytics, LocationEntry, User, WaitlistEntry } from "@/lib/types";

const emptyAnalytics: AdminAnalytics = {
  totalUsers: 0,
  totalAdmins: 0,
  waitlistCount: 0,
  totalLocations: 0,
  liveLocations: 0,
  comingSoonLocations: 0,
};

export default function AdminScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(emptyAnalytics);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"coming soon" | "live">("coming soon");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      try {
        const [userData, waitlistData, locationData, analyticsData] = await Promise.all([
          apiFetch<{ users: User[] }>("/api/admin/users"),
          apiFetch<{ waitlist: WaitlistEntry[] }>("/api/admin/waitlist"),
          apiFetch<{ locations: LocationEntry[] }>("/api/admin/location"),
          apiFetch<AdminAnalytics>("/api/admin/analytics"),
        ]);

        if (active) {
          setUsers(userData.users);
          setWaitlist(waitlistData.waitlist);
          setLocations(locationData.locations);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        Alert.alert("Unable to load admin data", error instanceof Error ? error.message : "Try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      active = false;
    };
  }, []);

  if (user?.role !== "admin") {
    return <Redirect href="/dashboard" />;
  }

  if (loading) {
    return <LoadingScreen label="Loading admin console..." />;
  }

  async function handleCreateLocation() {
    setSaving(true);

    try {
      const response = await apiFetch<{ location: LocationEntry }>("/api/admin/location", {
        method: "POST",
        body: {
          name,
          city,
          status,
        },
      });

      const nextLocations = [response.location, ...locations];
      setLocations(nextLocations);
      setAnalytics((current) => ({
        ...current,
        totalLocations: nextLocations.length,
        liveLocations: nextLocations.filter((item) => item.status === "live").length,
        comingSoonLocations: nextLocations.filter((item) => item.status === "coming soon").length,
      }));
      setName("");
      setCity("");
      setStatus("coming soon");
    } catch (error) {
      Alert.alert("Unable to create location", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenShell
      showBack
      title="Admin"
      subtitle="Whiteleo's investor demo console for demand, rollout readiness, and member activation."
    >
      <View style={styles.grid}>
        <StatCard label="Users" value={analytics.totalUsers} note="Authenticated profiles" />
        <StatCard label="Admins" value={analytics.totalAdmins} note="Ops-ready access" />
        <StatCard label="Waitlist" value={analytics.waitlistCount} note="Interested launch members" />
        <StatCard label="Live locations" value={analytics.liveLocations} note="Machines online" accent />
      </View>

      <GlassCard strong style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add rollout location</Text>
        <Field label="Gym name" value={name} onChangeText={setName} placeholder="Equinox Kensington" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="London" />
        <Field label="Status" value={status} onChangeText={(value) => setStatus(value === "live" ? "live" : "coming soon")} helper="Use 'coming soon' or 'live'" />
        <Button onPress={handleCreateLocation} disabled={saving || !name.trim() || !city.trim()}>
          Create Location
        </Button>
      </GlassCard>

      <GlassCard style={styles.listCard}>
        <Text style={styles.sectionTitle}>Member access</Text>
        {users.slice(0, 6).map((entry) => (
          <View key={entry.id} style={styles.listRow}>
            <View style={styles.rowMain}>
              <Text style={styles.itemTitle}>{entry.name}</Text>
              <Text style={styles.itemMeta}>{entry.email}</Text>
            </View>
            <Text style={styles.rolePill}>{entry.role}</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard style={styles.listCard}>
        <Text style={styles.sectionTitle}>Waitlist snapshot</Text>
        {waitlist.slice(0, 6).map((entry) => (
          <View key={entry.id} style={styles.listRow}>
            <View style={styles.rowMain}>
              <Text style={styles.itemTitle}>{entry.email}</Text>
              <Text style={styles.itemMeta}>{formatDate(entry.createdAt)}</Text>
            </View>
          </View>
        ))}
      </GlassCard>

      <GlassCard style={styles.listCard}>
        <Text style={styles.sectionTitle}>Locations</Text>
        {locations.map((entry) => (
          <View key={entry.id} style={styles.listRow}>
            <View style={styles.rowMain}>
              <Text style={styles.itemTitle}>{entry.name}</Text>
              <Text style={styles.itemMeta}>{entry.city}</Text>
            </View>
            <Text style={[styles.rolePill, entry.status === "live" ? styles.livePill : null]}>{entry.status}</Text>
          </View>
        ))}
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  formCard: {
    gap: 14,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  listCard: {
    gap: 14,
  },
  listRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  rowMain: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  itemMeta: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  rolePill: {
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  livePill: {
    color: theme.colors.neon,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.neonSoft,
  },
});
