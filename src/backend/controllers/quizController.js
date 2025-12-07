// Why: APIs for creating, listing, and fetching quizzes.
// controllers/quizController.js
import Quiz from "../models/Quiz.js";

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz" });
  }
};

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 });
  res.json(quizzes);
};

// Get one quiz
export const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  res.json(quiz);
};
