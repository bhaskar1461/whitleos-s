import type { UserPreferences } from "@/lib/types";

export const defaultPreferences: UserPreferences = {
  blend: "Performance Whey",
  protein: "42g",
  liquidBase: "Almond + Water",
  temperature: "Chilled",
  sweetness: "Balanced",
  pickupMode: "NFC Tap",
  boosters: ["Creatine"],
};

export const preferenceOptions = {
  blend: ["Performance Whey", "Vegan Isolate", "Lean Recovery"],
  protein: ["28g", "35g", "42g", "50g"],
  liquidBase: ["Almond + Water", "Oat + Water", "Coconut + Water"],
  temperature: ["Chilled", "Extra Cold", "Ambient"],
  sweetness: ["Low", "Balanced", "Bold"],
  pickupMode: ["NFC Tap", "QR Pickup", "App Unlock"],
  boosters: ["Creatine", "Electrolytes", "Collagen", "Focus Nootropics"],
} as const;

export const precisionFeatures = [
  {
    title: "Tap card or app",
    description:
      "Instant authentication via gym RFID, Apple Wallet-style tap flows, or the Whiteloo app.",
    icon: "phone-portrait-outline",
  },
  {
    title: "Customize your drink",
    description:
      "Precision macros, liquid base, boosters, sweetness, and pickup profile tuned to recovery.",
    icon: "options-outline",
  },
  {
    title: "Ready in 2 minutes",
    description:
      "Fresh protein shakes dispensed with chilled consistency, rapid sanitization, and telemetry.",
    icon: "flash-outline",
  },
] as const;

export const launchCities = ["London", "New York", "Tokyo", "Dubai"];

export const authBenefits = [
  "Launch-ready dashboard with personalized recovery presets",
  "Waitlist, onboarding, and gym rollout visibility in one place",
  "Admin analytics built for investor demos and operations planning",
];

export const workspaceLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "grid-outline" },
  { href: "/mealplan", label: "Meal Plan", icon: "restaurant-outline" },
  { href: "/workout", label: "Workout", icon: "barbell-outline" },
  { href: "/steps", label: "Steps", icon: "walk-outline" },
  { href: "/journal", label: "Journal", icon: "book-outline" },
  { href: "/progress", label: "Progress", icon: "stats-chart-outline" },
  { href: "/contact", label: "Contact", icon: "chatbubble-ellipses-outline" },
  { href: "/admin", label: "Admin", icon: "shield-checkmark-outline" },
] as const;

export const dashboardHighlights = [
  { label: "Access profile", value: "Founding member" },
  { label: "Machine unlock", value: "NFC + QR ready" },
  { label: "Telemetry tier", value: "Live diagnostics" },
];
