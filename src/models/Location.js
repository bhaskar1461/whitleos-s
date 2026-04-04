import mongoose, { Schema } from "mongoose";

const LocationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    status: { type: String, enum: ["coming soon", "live"], default: "coming soon" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Location = mongoose.models.Location || mongoose.model("Location", LocationSchema);

export default Location;
