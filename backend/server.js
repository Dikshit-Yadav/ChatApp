import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import "./config/password.js";
import { initSocket } from "./socket/index.js";
import sessionMiddleware from "./middleware/session.js";
let io;

connectDB();

const server = http.createServer(app);
export const getIO = () => io;

 io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

initSocket(io);

const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
