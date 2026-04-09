import express from "express";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import "./config/password.js";
import sessionMiddleware from "./middleware/session.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoute from "./routes/messageRouter.js";
import profileRoutes from "./routes/profileRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
    origin: ["http://localhost:5173",
        "http://localhost:4500/auth/google/callback"
    ],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/invite", invitationRoutes)
app.use("/conversation",conversationRoutes);
app.use("/message",messageRoute);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
    res.send("Hello server");
});

export default app;