import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: String,
    tags: [String],
    question: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    results: [{
        trait: String,
        title: String,
        description: String
    }],
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Quiz", QuizSchema);