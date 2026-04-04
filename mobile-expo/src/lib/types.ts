export type Role = "user" | "admin";

export interface UserPreferences {
  blend: string;
  protein: string;
  liquidBase: string;
  temperature: string;
  sweetness: string;
  pickupMode: string;
  boosters: string[];
}

export interface SubscriptionStatus {
  plan: string;
  status: string;
  renewalDate: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  preferences: UserPreferences;
  subscription: SubscriptionStatus;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LocationEntry {
  id: string;
  name: string;
  city: string;
  status: "coming soon" | "live";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MealEntry {
  id: string;
  userId?: string;
  name: string;
  category: string;
  calories: number;
  baseCalories?: number | null;
  quantity?: number | null;
  serving?: string | null;
  date: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WorkoutEntry {
  id: string;
  userId?: string;
  exercise: string;
  duration: number;
  date: string;
  source?: "manual" | "google_fit";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface StepEntry {
  id: string;
  userId?: string;
  count: number;
  date: string;
  source?: "manual" | "google_fit";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface JournalEntry {
  id: string;
  userId?: string;
  title: string;
  content: string;
  date: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalAdmins: number;
  waitlistCount: number;
  totalLocations: number;
  liveLocations: number;
  comingSoonLocations: number;
}
