import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
    text: { type: String, required: true },
    traits: {
        type: Object,
        required: true,
        default: {}
    }
});

const QuestionSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    text: { type: String, required: true },
    answers: [AnswerSchema]
});

export default mongoose.model("Question", QuestionSchema);