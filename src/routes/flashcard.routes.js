import express from "express";
import {
    generateFlashcardSet,
    getFlashcardSets,
    getFlashcardSetById,
    deleteFlashcardSet,
} from "../controllers/flashcard.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/generate", protectRoute, aiLimiter, generateFlashcardSet);
router.get("/getflashcardsets", protectRoute, getFlashcardSets);
router.get("/getflashcardsetbyid/:id", protectRoute, getFlashcardSetById);
router.delete("/deleteflashcardset/:id", protectRoute, deleteFlashcardSet);

export default router;
