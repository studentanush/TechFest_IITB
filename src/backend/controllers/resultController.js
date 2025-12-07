// Why: save marks and show leaderboard.
// controllers/resultController.js
import Result from "../models/Result.js";

export const submitResult = async (req, res) => {
  const result = await Result.create({
    user: req.user.id,
    ...req.body,
  });
  res.json({ success: true, result });
};

export const leaderboard = async (req, res) => {
  const data = await Result.find({ quiz: req.params.id })
    .populate("user", "name email")
    .sort({ score: -1 });

  res.json(data);
};
