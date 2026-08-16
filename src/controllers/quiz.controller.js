import Note from "../models/note.model.js";
import Quiz from "../models/quiz.model.js";
import Document from "../models/document.model.js";
import { generateQuiz } from "../utils/gemini.js";

const getSourceText = async (sourceType, sourceId, userId) => {
    if (sourceType === "note") {
        const note = await Note.findOne({
            _id: sourceId,
            owner: userId,
        });
        if (!note) return null;
        return note.content;
    }

    if (sourceType === "document") {
        const document = await Document.findOne({
            _id: sourceId,
            owner: userId,
        });
        if (!document) return null;
        return document.extractedText;
    }

    return null;
};

export const createQuiz = async (req, res) => {
    try {
        const { sourceType, sourceId, numQuestions } = req.body;

        if (!sourceType || !sourceId) {
            return res
                .status(400)
                .json({ message: "sourceType and sourceId are required" });
        }

        if (!["note", "document"].includes(sourceType)) {
            return res
                .status(400)
                .json({ message: "sourceType must be 'note' or 'document'" });
        }

        let count = parseInt(numQuestions, 10) || 5;
        if (count < 1) count = 1;
        if (count > 20) count = 20;

        const text = await getSourceText(sourceType, sourceId, req.user._id);
        if (text === null) {
            return res.status(404).json({ message: "Source not found" });
        }
        if (!text || text.trim() === "") {
            return res.status(400).json({
                message: "Source has no text to generate a quiz from",
            });
        }

        const aiResult = await generateQuiz(text, count);

        if (!aiResult.questions || aiResult.questions.length === 0) {
            return res.status(502).json({
                message: "Failed to generate quiz questions. Please try again.",
            });
        }

        const quiz = await Quiz.create({
            owner: req.user._id,
            sourceType,
            sourceId,
            title: aiResult.title,
            questions: aiResult.questions,
        });

        return res.status(201).json({
            message: "Quiz created successfully",
            quiz,
        });
    } catch (error) {
        console.log("Error in createQuiz", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ owner: req.user._id })
            .select("-questions.correctAnswer -questions.explanation")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: quizzes.length,
            quizzes,
        });
    } catch (error) {
        console.log("Error in getQuizzes", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;

        const quiz = await Quiz.findOne({
            _id: id,
            owner: req.user._id,
        }).select("-questions.correctAnswer -questions.explanation");

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        return res.status(200).json({ quiz });
    } catch (error) {
        console.log("Error in getQuizById", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        const quiz = await Quiz.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        return res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.log("Error in deleteQuiz", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                message: "answers must be an array of selected option indexes",
            });
        }

        const quiz = await Quiz.findOne({ _id: id, owner: req.user._id });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if (answers.length !== quiz.questions.length) {
            return res.status(400).json({
                message: `Expected ${quiz.questions.length} answers, received ${answers.length}`,
            });
        }

        let score = 0;
        const results = quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) score++;

            return {
                question: q.question,
                options: q.options,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation,
            };
        });

        const total = quiz.questions.length;
        const percentage = Math.round((score / total) * 100);

        return res.status(200).json({
            message: "Quiz submitted successfully",
            score,
            total,
            percentage,
            results,
        });
    } catch (error) {
        console.log("Error in submitQuiz", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
