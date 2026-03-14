import express from "express";
import {
  createQuiz,
  getPublishedQuizzes,
  addQuestion,
  addAnswer,
  addResult,
  submitQuiz,
  getQuizById
} from "../controllers/quiz.controller.js";

const router = express.Router();

router.post("/", createQuiz);
router.get("/", getPublishedQuizzes);

router.post("/:quizId/questions", addQuestion);
router.post("/questions/:questionId/answers", addAnswer);
router.post("/:quizId/results", addResult);

router.post("/:id/submit", submitQuiz);

router.get("/:id", getQuizById);

export default router;
