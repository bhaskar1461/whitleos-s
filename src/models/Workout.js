import mongoose, { Schema } from "mongoose";

const WorkoutSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exercise: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    date: { type: String, required: true },
    source: { type: String, enum: ["manual", "google_fit"], default: "manual" },
  },
  { timestamps: true }
);

const Workout = mongoose.models.Workout || mongoose.model("Workout", WorkoutSchema);

export default Workout;
