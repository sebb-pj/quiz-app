import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "/config/db.js";
import quizRoutes from "/routes/quiz.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ message: "As alive as Frieren" });
});

app.use("/api/quizzes", quizRoutes);

export default app;