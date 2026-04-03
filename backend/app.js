import express from "express";
import passport from "passport";
import cors from "cors";
import "./config/password.js";
import sessionMiddleware from "./middleware/session.js";
import authRoutes from "./routes/authRoutes.js";


const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("Hello server");
});

export default app;