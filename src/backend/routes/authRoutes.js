import express from "express";
import { signup, login } from "../controllers/authController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// ---- Rate Limiter for Auth (Security) ---- //
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,                  // limit each IP to 20 requests
  message: "Too many attempts, please try again later."
});

// ---- Auth Routes ---- //
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

export default router;
