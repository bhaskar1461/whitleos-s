import mongoose, { Schema } from "mongoose";

const WaitlistSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Waitlist = mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema);

export default Waitlist;
