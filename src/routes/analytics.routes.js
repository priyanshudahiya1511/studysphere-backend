import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAnalytics);

export default router;
