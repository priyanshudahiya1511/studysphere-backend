import express from "express";

const router = express.Router();

import {
    startChat,
    sendMessage,
    getChatSessions,
    getChatSessionById,
    deleteChatSession,
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

router.post("/start", protectRoute, startChat);
router.post("/send/:id", protectRoute, aiLimiter, sendMessage);
router.get("/getsessions", protectRoute, getChatSessions);
router.get("/getsessionbyid/:id", protectRoute, getChatSessionById);
router.delete("/deletesession/:id", protectRoute, deleteChatSession);

export default router;
