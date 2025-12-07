import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";


dotenv.config();

// App initialization
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Connect MongoDB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("QUIZZCO.AI Backend is running...");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);

// ---------------- SOCKET.IO SETUP ---------------- //
import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Basic socket test
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ------------------------------------------------- //

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// mongodb+srv://baisrenukaa_db_user:uhEYwGGsLNneV8Th@cluster0.76pbhdm.mongodb.net/?appName=Cluster0