import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";

export function HeroMachine() {
  return (
    <View style={styles.shell}>
      <View style={styles.column} />
      <View style={styles.machineBody}>
        <View style={styles.glow} />
        <View style={styles.dispenserRail} />
        <View style={styles.dispenserRow}>
          <View style={styles.nozzle} />
          <View style={styles.nozzle} />
          <View style={styles.nozzle} />
        </View>
        <View style={styles.display}>
          <Text style={styles.displayText}>2m</Text>
        </View>
      </View>
      <View style={styles.column} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 260,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#090909",
    flexDirection: "row",
    alignItems: "stretch",
  },
  column: {
    width: 58,
    backgroundColor: "#060606",
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  machineBody: {
    flex: 1,
    backgroundColor: "#111111",
    position: "relative",
    justifyContent: "space-between",
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
  glow: {
    position: "absolute",
    left: "25%",
    right: "25%",
    bottom: -40,
    height: 80,
    borderRadius: 999,
    backgroundColor: "rgba(182,255,0,0.2)",
  },
  dispenserRail: {
    alignSelf: "center",
    width: "64%",
    height: 110,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#171717",
  },
  dispenserRow: {
    position: "absolute",
    top: 78,
    alignSelf: "center",
    width: "54%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nozzle: {
    width: 10,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#C7C7C7",
  },
  display: {
    alignSelf: "center",
    minWidth: 84,
    borderRadius: 16,
    backgroundColor: theme.colors.neonSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  displayText: {
    color: theme.colors.neon,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
});
