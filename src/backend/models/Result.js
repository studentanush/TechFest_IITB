// Why: store each student’s quiz attempt & score.
// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    score: Number,
    answers: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
