import mongoose, { Schema } from "mongoose";

import { defaultPreferences } from "@/lib/utils";

const PreferenceSchema = new Schema(
  {
    blend: { type: String, default: defaultPreferences.blend },
    protein: { type: String, default: defaultPreferences.protein },
    liquidBase: { type: String, default: defaultPreferences.liquidBase },
    temperature: { type: String, default: defaultPreferences.temperature },
    sweetness: { type: String, default: defaultPreferences.sweetness },
    pickupMode: { type: String, default: defaultPreferences.pickupMode },
    boosters: { type: [String], default: defaultPreferences.boosters },
  },
  { _id: false }
);

const SubscriptionSchema = new Schema(
  {
    plan: { type: String, default: "Founding Access" },
    status: { type: String, default: "Pending machine rollout" },
    renewalDate: { type: Date, default: null },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferences: { type: PreferenceSchema, default: () => ({}) },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
