import mongoose, { Schema } from "mongoose";

const StepEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    count: { type: Number, required: true },
    date: { type: String, required: true },
    source: { type: String, enum: ["manual", "google_fit"], default: "manual" },
  },
  { timestamps: true }
);

const StepEntry = mongoose.models.StepEntry || mongoose.model("StepEntry", StepEntrySchema);

export default StepEntry;
