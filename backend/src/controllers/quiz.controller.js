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
            { $push: { 
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
    const { answers } = req.body;

    const questions = await Question.find({ quizId: req.params.id });

    const scores = {};

    questions.forEach((q) => {
        const userAnswer = answers.find((a) => a.questionId === q._id);
        if (!userAnswer) return;

        const answer = q.answers.id(userAnswer.answerId);
        if (!answer) return;

        for (const [trait, points] of answer.traits.entries()) {
            scores[trait] = (scores[trait] || 0) + points;
        }
    });

    const resultTrait = Object.keys(scores).reduce((a, b) => 
        scores[a] > scores[b] ? a : b
    );

    await QuizAnalytics.findOneAndUpdate(
        { quizId: req.params.id },
        { 
            $inc: { 
                totalAttempts: 1, 
                [`resultCounts.${resultTrait}`]: 1 
            },
            lastAttemptAt: new Date()
        }
    );
   
    res.json({ result: resultTrait, scores})
};