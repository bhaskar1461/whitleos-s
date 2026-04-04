import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import { theme } from "@/lib/theme";
import { AuthProvider } from "@/providers/AuthProvider";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.background,
    card: theme.colors.backgroundAlt,
    border: theme.colors.border,
    primary: theme.colors.neon,
    text: theme.colors.text,
    notification: theme.colors.neon,
  },
};

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
      </ThemeProvider>
    </AuthProvider>
  );
}
