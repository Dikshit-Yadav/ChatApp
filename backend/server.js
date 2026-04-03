import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import "./config/password.js";


connectDB();

const server = http.createServer(app);



const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
