import {
  CreditCard,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";

export const precisionFeatures = [
  {
    title: "Tap card or app",
    description:
      "Instant authentication via Apple Wallet style tap flows, gym RFID, or the Whiteloo mobile app.",
    icon: CreditCard,
  },
  {
    title: "Customize your drink",
    description:
      "Precision macros, liquid base, boosters, sweetness, and pickup profile tuned to your recovery ritual.",
    icon: SlidersHorizontal,
  },
  {
    title: "Ready in 2 minutes",
    description:
      "Fresh protein shakes dispensed with chilled consistency, rapid sanitization, and machine telemetry.",
    icon: TimerReset,
  },
];

export const launchCities = ["London", "New York", "Tokyo", "Dubai"];

export const launchSignals = [
  {
    title: "Fresh in 2 minutes",
    description: "No shaker. No powder mess. No queue anxiety.",
    icon: Zap,
  },
  {
    title: "Machine monitored",
    description: "Inventory, sanitation status, and pour health tracked in real time.",
    icon: ShieldCheck,
  },
  {
    title: "Premium gym rollout",
    description: "Launching with a focused footprint in design-led performance spaces.",
    icon: MapPin,
  },
];

export const dashboardHighlights = [
  {
    label: "Access profile",
    value: "Founding member",
  },
  {
    label: "Machine unlock",
    value: "NFC + QR ready",
  },
  {
    label: "Telemetry tier",
    value: "Live diagnostics",
  },
];

export const authBenefits = [
  "Launch-ready dashboard with personalized recovery presets",
  "Waitlist, onboarding, and gym rollout visibility in one place",
  "Admin analytics built for investor demos and operations planning",
];

export const premiumNotes = [
  {
    title: "Kinetic Precision",
    copy: "Every flow feels immediate, minimal, and calibrated for premium fitness spaces.",
    icon: Sparkles,
  },
  {
    title: "Luxury operations layer",
    copy: "Admin tools track adoption, waitlist demand, and location readiness without visual clutter.",
    icon: ShieldCheck,
  },
];
