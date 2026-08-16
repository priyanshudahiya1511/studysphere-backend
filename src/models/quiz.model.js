import mongoose, { Schema } from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },

    options: {
        type: [String],
        validate: {
            validator: (arr) => arr.length == 4,
            message: "Each question must have exactly 4 options",
        },
    },

    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
    },

    explanation: {
        type: String,
        default: "",
    },
});

const quizSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sourceType: {
            type: String,
            enum: ["note", "document"],
            required: true,
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
        questions: {
            type: [questionSchema],
            required: true,
        },
    },
    { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
