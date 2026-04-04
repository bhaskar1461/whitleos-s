import { z } from "zod";

import { preferenceOptions } from "@/lib/utils";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or admin ID is required.").max(120),
  password: z.string().min(1, "Password is required."),
});

export const waitlistSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const preferencesSchema = z.object({
  blend: z.enum(preferenceOptions.blend),
  protein: z.enum(preferenceOptions.protein),
  liquidBase: z.enum(preferenceOptions.liquidBase),
  temperature: z.enum(preferenceOptions.temperature),
  sweetness: z.enum(preferenceOptions.sweetness),
  pickupMode: z.enum(preferenceOptions.pickupMode),
  boosters: z.array(z.enum(preferenceOptions.boosters)).max(4),
});

export const locationSchema = z.object({
  name: z.string().trim().min(2, "Location name is required.").max(120),
  city: z.string().trim().min(2, "City is required.").max(80),
  status: z.enum(["coming soon", "live"]),
});

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.");

export const mealSchema = z.object({
  name: z.string().trim().min(1, "Meal name is required.").max(120),
  category: z.string().trim().min(1).max(60),
  calories: z.number().min(0).max(10000),
  baseCalories: z.number().min(0).max(10000).optional(),
  quantity: z.number().min(1).max(20).optional(),
  serving: z.string().trim().max(120).optional(),
  date: dateString,
});

export const workoutSchema = z.object({
  exercise: z.string().trim().min(1, "Exercise name is required.").max(120),
  duration: z.number().min(1).max(1440),
  date: dateString,
  source: z.enum(["manual", "google_fit"]).optional(),
});

export const stepSchema = z.object({
  count: z.number().min(1).max(100000),
  date: dateString,
  source: z.enum(["manual", "google_fit"]).optional(),
});

export const journalSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  content: z.string().trim().min(1, "Content is required.").max(4000),
  date: dateString,
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  countryCode: z.string().trim().min(1).max(8),
  phone: z.string().trim().min(3, "Phone number is required.").max(24),
  message: z.string().trim().min(8, "Message must be at least 8 characters.").max(2000),
});
