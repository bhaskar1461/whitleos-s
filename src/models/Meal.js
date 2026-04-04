import mongoose, { Schema } from "mongoose";

const MealSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    calories: { type: Number, required: true },
    baseCalories: { type: Number, default: null },
    quantity: { type: Number, default: 1 },
    serving: { type: String, default: "1 serving" },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

const Meal = mongoose.models.Meal || mongoose.model("Meal", MealSchema);

export default Meal;
