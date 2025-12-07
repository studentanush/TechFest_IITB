import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------- SIGNUP ---------------- //
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher", // default role for creators
    });

    const token = generateToken(user);

    // Never return password
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({
      message: "Signup successful",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup error", error: error.message });
  }
};

// ---------------- LOGIN ---------------- //
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    // Remove password
    const { password: _, ...userData } = user.toObject();

    res.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};
