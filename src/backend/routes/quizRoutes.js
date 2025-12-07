// Why: frontend needs stable endpoints for quizzes.
// routes/quizRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createQuiz, getAllQuizzes, getQuiz } from "../controllers/quizController.js";

const router = express.Router();

router.post("/create", protect, createQuiz);
router.get("/", getAllQuizzes);
router.get("/:id", getQuiz);

export default router;
