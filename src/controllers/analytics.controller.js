import Note from "../models/note.model.js";
import PlannerTask from "../models/plannerTask.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Document from "../models/document.model.js";
import Summary from "../models/summary.model.js";
import Quiz from "../models/quiz.model.js";
import FlashcardSet from "../models/flashcard.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        const [
            noteCount,
            documentCount,
            summaryCount,
            quizCount,
            flashcardSetCount,
        ] = await Promise.all([
            Note.countDocuments({ owner: userId }),
            Document.countDocuments({ owner: userId }),
            Summary.countDocuments({ owner: userId }),
            Quiz.countDocuments({ owner: userId }),
            FlashcardSet.countDocuments({ owner: userId }),
        ]);

        const [totalTasks, completedTasks] = await Promise.all([
            PlannerTask.countDocuments({ owner: userId }),
            PlannerTask.countDocuments({ owner: userId, status: "completed" }),
        ]);

        const pendingTasks = totalTasks - completedTasks;
        const taskCompletionRate =
            totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

        const quizAttempts = await QuizAttempt.find({ owner: userId }).sort({
            createdAt: 1,
        });

        const totalAttempts = quizAttempts.length;

        const averageScore =
            totalAttempts > 0
                ? Math.round(
                      quizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                          totalAttempts
                  )
                : 0;

        const bestScore =
            totalAttempts > 0
                ? Math.max(...quizAttempts.map((a) => a.percentage))
                : 0;

        const recentAttempts = quizAttempts.slice(-10).map((a) => ({
            percentage: a.percentage,
            score: a.score,
            total: a.total,
            date: a.createdAt,
        }));

        return res.status(200).json({
            content: {
                notes: noteCount,
                documents: documentCount,
                summaries: summaryCount,
                quizzes: quizCount,
                flashcardSets: flashcardSetCount,
            },
            planner: {
                total: totalTasks,
                completed: completedTasks,
                pending: pendingTasks,
                completionRate: taskCompletionRate,
            },
            quizPerformance: {
                totalAttempts,
                averageScore,
                bestScore,
                recentAttempts,
            },
        });
    } catch (error) {
        console.log("Error in getAnalytics", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
