import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

dotenv.config();

// ---------------- APP INITIALIZATION ---------------- //
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
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ROOM STORAGE USING MAP()
const rooms = new Map();

// ----------------- PLAYER EVENTS -----------------
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }, callback) => {
    console.log(roomCode);
    console.log(rooms);
    const room = rooms.get(roomCode);

    if (!room) {
      callback({ error: "Room not found" });
      return;
    }

    room.players.set(socket.id, playerName);
    socket.join(roomCode);

    console.log(`${playerName} joined room ${roomCode}`);

    io.to(roomCode).emit("updatePlayers", Array.from(room.players.values()));

    callback({ success: true });
  });

  socket.on(
    "submitAnswer",
    ({ roomCode, answer, correctAnswer, timeTaken, totalTime }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        callback({ error: "Room not found" });
        return;
      }

      let points = 0;
      const isCorrect = answer === correctAnswer;

      if (isCorrect) {
        points = 10 + (totalTime - timeTaken) * 5;
        if (points < 0) points = 0;
      }

      const oldScore = room.scores.get(socket.id) || 0;
      room.scores.set(socket.id, oldScore + points);

      const leaderboard = Array.from(room.scores.entries())
        .map(([id, score]) => ({
          playerName: room.players.get(id),
          score,
        }))
        .sort((a, b) => b.score - a.score);

      io.to(roomCode).emit("leaderboardUpdate", leaderboard);

      callback({
        correct: isCorrect,
        earnedPoints: points,
        totalScore: room.scores.get(socket.id),
      });
    }
  );

  // Player disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    rooms.forEach((room, code) => {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);

        io.to(code).emit(
          "updatePlayers",
          Array.from(room.players.values())
        );
      }
    });
  });
});

// ----------------- ADMIN NAMESPACE -----------------
const adminNamespace = io.of("/admin");

adminNamespace.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  socket.on("createRoom", ({ hostName,quizTime }, callback) => {
    const roomCode = nanoid(6);
    console.log(hostName);
    rooms.set(roomCode, {
      admin: hostName,
      quizTime:quizTime,
      play:false,
      players: new Map(),
      scores: new Map(),
    });

    console.log(`Room ${roomCode} created by ${hostName}`);x

    callback({ roomCode });
  });

  socket.on("playOnOff", ({ roomCode, play }, callback) => {
    const room = rooms.get(roomCode);
    if (!room) {
        callback({ error: "Room not found" });
        return;
    }

    room.play = play;

    // Inform all players that quiz started
    io.to(roomCode).emit("quizStarted", play );

    callback({ status: "ok" });
});

  socket.on("sendQuestion", ({ roomCode, question }, callback) => {
    if (!rooms.has(roomCode)) {
      callback({ error: "Room not found" });
      return;
    }

    io.to(roomCode).emit("newQuestion", question);

    callback({ status: "sent" });
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
