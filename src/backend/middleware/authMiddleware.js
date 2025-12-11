/* Why we need this:
All internal features (upload document, generate quiz, save quiz) should only work after login. This middleware protects routes. */

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // { id, email }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
