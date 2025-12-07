// Why: required by quiz result page in frontend.
// routes/resultRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { submitResult, leaderboard } from "../controllers/resultController.js";

const router = express.Router();

router.post("/submit", protect, submitResult);
router.get("/leaderboard/:id", leaderboard);

export default router;
