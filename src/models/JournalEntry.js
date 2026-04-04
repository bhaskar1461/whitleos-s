import mongoose, { Schema } from "mongoose";

const JournalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

const JournalEntry =
  mongoose.models.JournalEntry || mongoose.model("JournalEntry", JournalEntrySchema);

export default JournalEntry;
