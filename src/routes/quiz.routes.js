import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createQuiz,
    getQuizzes,
    getQuizById,
    submitQuiz,
    deleteQuiz,
} from "../controllers/quiz.controller.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/create", protectRoute, aiLimiter, createQuiz);
router.get("/getquizzes", protectRoute, getQuizzes);
router.get("/getquizbyid/:id", protectRoute, getQuizById);
router.post("/submit/:id", protectRoute, submitQuiz);
router.delete("/deletequiz/:id", protectRoute, deleteQuiz);

export default router;
