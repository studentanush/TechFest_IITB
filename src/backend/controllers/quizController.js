// Why: APIs for creating, listing, and fetching quizzes.
// controllers/quizController.js
import Quiz from "../models/Quiz.js";

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz" });
  }
};

// Get all quizzes
export const getQuiz = async (req, res) => {
  const id = req.query.id;
  console.log(id);
  const quiz = await Quiz.find({
    _id:id
  }).populate("createdBy","name email");
  
  res.json(quiz);
};

// Get one quiz
export const getAllQuiz = async (req, res) => {
  console.log("hehre in getQUiz")
  const id = req.userId;
  const quiz = await Quiz.find({
      createdBy:id
  });
  console.log(quiz);
  res.json(quiz);
};
