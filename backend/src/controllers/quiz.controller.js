import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import QuizAnalytics from "../models/QuizAnalytics.js";

export const createQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);

        await QuizAnalytics.create({ quizId: quiz._i, resultCounts: {} });

        res.status(201).json(quiz);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getPublishedQuizzes = async (req, res) => {
    const quizzes = await Quiz.find({ published: true }).select(
        "title description tags"
    );

    res.json(quizzes);
};

export const addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;

        const question = await Question.create({
            quizId,
            text: req.body.text,
            answers: []
        });

        await Quiz.findByIdAndUpdate(quizId, {
            $push: { question: question._id }
        });

        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId);

        question.answers.push({
            text: req.body.text,
            traits: req.body.traits
        });

        await question.save();

        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addResult = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            {
                $push: {
                    results: {
                        trait: req.body.trait,
                        title: req.body.title,
                        description: req.body.description
                    }
                }
            },
            { new: true }
        );

        res.json(quiz);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    console.log("Submitted answers:", answers);

    const questions = await Question.find({ quizId: req.params.id });

    const scores = {};

    questions.forEach((q) => {
      // this snippet finds the user's answer for this question
      const userAnswer = answers.find(
        (a) => a.questionId === q._id.toString()
      );

      if (!userAnswer) return;

      // this should find the answer inside the question
      const answer = q.answers.id(userAnswer.answerId);

      console.log("Matched answer:", answer);

      if (!answer || !answer.traits) return;

      // this turns traits into a plain object
      for (const [trait, points] of Object.entries(answer.traits)) {
        scores[trait] = (scores[trait] || 0) + points;
      }
    });

    console.log("Scores object:", scores);

    // if nothing was scored return an error
    if (Object.keys(scores).length === 0) {
      return res.status(400).json({
        message: "No valid answers submitted",
      });
    }

    // this part determines highest scoring trait
    const resultTrait = Object.entries(scores).reduce(
      (max, [trait, score]) =>
        score > max.score ? { trait, score } : max,
      { trait: null, score: -Infinity }
    ).trait;

    res.json({
      result: resultTrait,
      scores,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({ quizId: quiz._id });

    res.json({
      ...quiz.toObject(),
      questions
    });

  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};