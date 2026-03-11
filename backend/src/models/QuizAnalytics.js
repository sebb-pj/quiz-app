import mongoose from "mongoose";

const QuizAnalyticsSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", unique: true },
    totalAttempts: { type: Number, default: 0 },
    resultCounts: { type: Map, of: Number },
    lastAttemptAt: Date
});

export default mongoose.model("QuizAnalytics", QuizAnalyticsSchema);