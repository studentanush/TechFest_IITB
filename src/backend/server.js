import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
dotenv.config();

const app = express();

// middleware
app.use(express.json());

// connect database
connectDB();

// routes
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.use(cors());


// websocket paet here
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --------------------------------------------
//          ROOM STORE USING MAP()
// --------------------------------------------
const rooms = new Map();
// rooms.set("abc123", {
//   admin: "Alice",
//   players: new Map([
//       ["socket1", "Bob"],
//       ["socket2", "Charlie"]
//   ])
// });

// ----------------- DEFAULT NAMESPACE: Players -----------------
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Player joins a room
  socket.on("joinRoom", ({ roomCode, playerName }, callback) => {
    const room = rooms.get(roomCode); // Map GET()

    if (!room) {
      callback({ error: "Room not found" });
      return;
    }

    // Add player: Map.set()
    room.players.set(socket.id, playerName);

    socket.join(roomCode);

    console.log(`${playerName} joined room ${roomCode}`);

    // Notify players: convert Map values ➜ array
    io.to(roomCode).emit(
      "updatePlayers",
      Array.from(room.players.values())
    );

    callback({ success: true });
  });

  // Player submits answer
  socket.on("submitAnswer", ({ roomCode, answer,correctAnswer,time }, callback) => {
    console.log(`Answer from ${socket.id} in ${roomCode}:`, answer);
    // we will add validation here later for the questions

    callback({ status: "ok" });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    // Loop through all rooms: Map.forEach()
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

// ----------------- ADMIN NAMESPACE: /admin -----------------
const adminNamespace = io.of("/admin");

adminNamespace.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  // Admin creates room
  socket.on("createRoom", ({ adminName }, callback) => {
    const roomCode = nanoid(6);

    // Store using Map.set()
    rooms.set(roomCode, {
      admin: adminName,
      players: new Map()
    });

    console.log(`Room ${roomCode} created by ${adminName}`);

    callback({ roomCode });
  });

  // Admin sends question
  socket.on("sendQuestion", ({ roomCode, question }, callback) => {
    if (!rooms.has(roomCode)) {
      callback({ error: "Room not found" });
      return;
    }

    io.to(roomCode).emit("newQuestion", question);

    callback({ status: "sent" });
  }); 
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);




