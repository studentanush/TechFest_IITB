import { io } from "socket.io-client";

export const playerSocket = io("http://localhost:5000");
export const adminSocket = io("http://localhost:5000/admin");