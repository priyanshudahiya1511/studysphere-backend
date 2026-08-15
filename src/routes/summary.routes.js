import express from "express";
import {
    generateSummary,
    getSummaries,
    getSummaryById,
    deleteSummary,
} from "../controllers/summary.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/generate", protectRoute, aiLimiter, generateSummary);
router.get("/getsummaries", protectRoute, getSummaries);
router.get("/getsummarybyid/:id", protectRoute, getSummaryById);
router.delete("/deletesummary/:id", protectRoute, deleteSummary);

export default router;
