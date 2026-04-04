export const defaultPreferences = {
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
};

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function serializeDocument(document) {
  if (!document) return null;

  const source = typeof document.toObject === "function" ? document.toObject() : document;
  const { _id, __v, password, ...rest } = source;

  return {
    id: _id ? String(_id) : rest.id,
    ...rest,
    createdAt:
      rest.createdAt instanceof Date ? rest.createdAt.toISOString() : rest.createdAt || null,
    updatedAt:
      rest.updatedAt instanceof Date ? rest.updatedAt.toISOString() : rest.updatedAt || null,
  };
}

export function withResolvedSubscription(user) {
  if (!user) return null;

  const defaultSubscription = {
    plan: user.role === "admin" ? "Admin Access" : "Founding Access",
    status: user.role === "admin" ? "Unlocked" : "Pending machine rollout",
    renewalDate: null,
  };

  return {
    ...user,
    preferences: {
      ...defaultPreferences,
      ...(user.preferences || {}),
      boosters: Array.isArray(user.preferences?.boosters)
        ? user.preferences.boosters
        : defaultPreferences.boosters,
    },
    subscription: {
      ...defaultSubscription,
      ...(user.subscription || {}),
    },
  };
}

export function serializeUser(user) {
  return withResolvedSubscription(serializeDocument(user));
}

export function formatDate(value) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
